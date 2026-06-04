import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Agenda, TokenStore } from "./types";
import { SettingService } from "../settings/settings.service";
import { AgendaService } from "../agenda/agenda.service";
import { JadwalService } from "../jadwal/jadwal.service";
import { MateriService } from "../materi/materi.service";
import { PaketSoalService } from "../paket-soal/paket-soal.service";
import { SoalService, SoalType } from "../soal/soal.service";
import { SiswaService } from "../siswa/siswa.service";
import { agendaSiswaTable, agendaTable, db, jadwalTable, jawabanSoalTable, materiSoalTable, paketSoalTable, soalTable, workSessionAnswerTable, workSessionTable } from "src/common/db";
import { eq, and } from "drizzle-orm";

const SYNC_KEY = "event_sync";

@Injectable()
export class CoreSyncService {
    private readonly logger = new Logger(CoreSyncService.name);
    private readonly config = {
        url: process.env.LMS_BO_URL,
        key: process.env.LMS_BO_KEY,
        id: process.env.LMS_BO_ID,
    };
    private readonly KEY = `bo_session_${this.config.id}`;

    constructor(
        private readonly httpService: HttpService,
        private readonly storage: SettingService,
        private readonly agendaService: AgendaService,
        private readonly jadwalService: JadwalService,
        private readonly paketSoalService: PaketSoalService,
        private readonly materiService: MateriService,
        private readonly soalService: SoalService,
        private readonly siswaService: SiswaService,
    ) { }

    async listEvents(): Promise<(Omit<Agenda, 'jadwal'> & { synced: boolean })[]> {
        const token = await this.getAccessToken();
        const syncedEvent = await this.storage.fetch<string[]>(SYNC_KEY) || [];

        const res = await firstValueFrom(
            this.httpService.get<any>(`${this.config.url}/masterEvent`, {
                headers: {
                    "x-nexus-lms-bo": this.config.key,
                    "server-id": this.config.id,
                    "Authorization": `Bearer ${token}`
                }
            })
        );

        const result = res.data.data.map((x: any) => ({ ...x, synced: syncedEvent.includes(x.id) }));
        return result;
    }

    async syncEvent(eventId: string) {
        const event = await this.fetchEventDetail(eventId);

        // console.log(event)

        // appendFileSync(
        //     "/home/arta/pengerjaan/nexus-lms-be/events.log",
        //     JSON.stringify(event, null, 2) + "\n---\n",
        //     "utf8"
        // );

        // return;

        const syncedEvent = await this.storage.fetch<string[]>(SYNC_KEY) || [];
        if (!syncedEvent.includes(event.id)) {
            syncedEvent.push(event.id);
            await this.storage.store<string[]>(syncedEvent, SYNC_KEY);
        }

        const agenda = await this.agendaService.save({
            id: event.id,
            title: event.nama_event,
            startTime: this.parseMysqlDatetime(event.mulai.toString()),
            endTime: this.parseMysqlDatetime(event.selesai.toString()),
            remoteId: event.id,
        });

        for (const jadwal of event.jadwal) {
            if (!jadwal.paket_soal) {
                this.logger.warn(`Jadwal ${jadwal.id} has no paket_soal, skipping`);
                continue;
            }

            const paketSoal = await this.paketSoalService.save({
                id: jadwal.paket_soal.id,
                title: jadwal.paket_soal.nama_paket_soal,
                description: '',
                remoteId: jadwal.paket_soal.id,
            });

            for (const materi of jadwal.paket_soal.materi) {
                const materiSoal = await this.materiService.save({
                    id: materi.id,
                    paketSoalId: paketSoal.id,
                    title: materi.nama_materi,
                    order: materi.urutan ?? 0,
                    timeLimit: materi.waktu || 0,
                    remoteId: materi.id,
                });

                for (const soal of materi.soal) {
                    const payload = {
                        id: soal.id,
                        materiSoalId: materiSoal.id,
                        prompt: soal.soal,
                        type: "single-choice" as SoalType,
                        order: soal.nomor_soal,
                        weightCorrect: soal.bobot_benar,
                        weightWrong: soal.bobot_salah,
                        remoteId: soal.id,
                        jawaban: soal.pilihan_jawaban.map(jw => {
                            return {
                                id: (jw as any).id,
                                value: jw.isi_opsi,
                                isCorrect: jw.nama_opsi == soal.kunci_jawaban,
                                order: this.letterToNumber(jw.nama_opsi),
                            }
                        }),
                    }

                    await this.soalService.save(payload);
                }
            }

            await this.jadwalService.save({
                id: jadwal.id,
                agendaId: agenda.id,
                paketSoalId: paketSoal.id,
                title: jadwal.nama_jadwal,
                token: jadwal.token,
                startTime: this.parseMysqlDatetime(jadwal.mulai.toString()),
                endTime: this.parseMysqlDatetime(jadwal.selesai.toString()),
                timeLimit: jadwal.paket_soal.waktu,
                attempts: 1,
                remoteId: jadwal.id,
            });
        }

        for (const peserta of event.peserta) {
            try {
                this.logger.log(`Syncing student ${peserta.username}...`);
                const siswa = await this.siswaService.create({
                    nis: peserta.nis,
                    name: peserta.nama_siswa,
                    birthDate: this.parseMysqlDatetime(peserta.tgl_lahir.toString()),
                    kelas: peserta.nama_kelas,
                    username: peserta.username,
                    password: peserta.password,
                });

                await this.agendaService.addSiswa(agenda.id, siswa.id, peserta.id_peserta_perevent, peserta.id_peserta_perevent);
            } catch (e) {
                this.logger.error(`Failed to sync student ${peserta.username}: ${e.message}`, e.stack);
            }
        }
    }

    async pushResults(agendaId: string) {
        const agenda = await this.agendaService.findById(agendaId);
        if (!agenda.remoteId) {
            throw new Error("Cannot push results for an agenda without a remoteId. Please re-sync the event first.");
        }

        const jadwals = await db.select().from(jadwalTable).where(eq(jadwalTable.agendaId, agendaId));
        const results: any[] = [];

        for (const jadwal of jadwals) {
            const sessions = await db.select().from(workSessionTable)
                .where(and(
                    eq(workSessionTable.jadwalId, jadwal.id),
                    eq(workSessionTable.status, 'finished')
                ));

            for (const session of sessions) {
                const participation = await db.select().from(agendaSiswaTable)
                    .where(and(
                        eq(agendaSiswaTable.agendaId, agendaId),
                        eq(agendaSiswaTable.siswaId, session.siswaId)
                    )).limit(1).then(res => res[0]);

                if (!participation) continue;

                const answers = await db.select({
                    id: workSessionAnswerTable.id,
                    soalId: workSessionAnswerTable.soalId,
                    soalRemoteId: soalTable.id, // Now same as id
                    materiSoalId: soalTable.materiSoalId,
                    soalOrder: soalTable.order,
                    value: workSessionAnswerTable.value,
                    jawabanSoalId: workSessionAnswerTable.jawabanSoalId,
                    isCorrect: jawabanSoalTable.isCorrect,
                    weightCorrect: soalTable.weightCorrect,
                    weightWrong: soalTable.weightWrong
                })
                    .from(workSessionAnswerTable)
                    .innerJoin(soalTable, eq(workSessionAnswerTable.soalId, soalTable.id))
                    .leftJoin(jawabanSoalTable, eq(workSessionAnswerTable.jawabanSoalId, jawabanSoalTable.id))
                    .where(eq(workSessionAnswerTable.workSessionId, session.id));

                let idMateri = session.materiSoalId;
                if (!idMateri && answers.length > 0) {
                    idMateri = answers[0].materiSoalId;
                }

                results.push({
                    id_jawaban: session.id,
                    id_jadwal: jadwal.id,
                    id_peserta_per_event: participation.remoteId,
                    id_paket_soal: session.paketSoalId,
                    id_materi: idMateri || null,
                    waktu_mulai: session.startedAt.toISOString().replace('T', ' ').substring(0, 19),
                    waktu_selesai: session.finishedAt?.toISOString().replace('T', ' ').substring(0, 19),
                    detail: answers.map(ans => {
                        const isCorrect = ans.isCorrect ?? false;
                        return {
                            id_jawaban_detail: ans.id,
                            id_jawaban: session.id,
                            id_soal: ans.soalRemoteId,
                            no_soal: ans.soalOrder,
                            jawaban: ans.jawabanSoalId || ans.value || "",
                            benar: isCorrect ? 1 : 0,
                            salah: isCorrect ? 0 : 1,
                            nilai: isCorrect ? ans.weightCorrect : ans.weightWrong,
                        };
                    })
                });
            }
        }

        if (results.length === 0) {
            this.logger.warn(`No finished sessions found to push for agenda ${agendaId}`);
            return { message: "No results to push" };
        }

        const totalSoalRows = await db.select({ id: soalTable.id })
            .from(soalTable)
            .innerJoin(materiSoalTable, eq(soalTable.materiSoalId, materiSoalTable.id))
            .innerJoin(paketSoalTable, eq(materiSoalTable.paketSoalId, paketSoalTable.id))
            .innerJoin(jadwalTable, eq(jadwalTable.paketSoalId, paketSoalTable.id))
            .where(eq(jadwalTable.agendaId, agendaId));

        const payload = {
            jawaban: results
        };

        const token = await this.getAccessToken();
        this.logger.debug(`Pushing results for agenda ${agendaId}: ${JSON.stringify(payload, null, 2)}`);
        const res = await firstValueFrom(
            this.httpService.post(`${this.config.url}/upload-jawaban`, payload, {
                headers: {
                    "x-nexus-lms-bo": this.config.key,
                    "server-id": this.config.id,
                    "Authorization": `Bearer ${token}`
                }
            })
        );

        return res.data;
    }

    private async fetchEventDetail(eventId: string): Promise<Agenda> {
        const token = await this.getAccessToken();
        const res = await firstValueFrom(
            this.httpService.get<any>(`${this.config.url}/masterEventDetails/${eventId}`, {
                headers: {
                    "x-nexus-lms-bo": this.config.key,
                    "server-id": this.config.id,
                    Authorization: `Bearer ${token}`,
                },
            })
        );
        return res.data.data;
    }

    private async getAccessToken(): Promise<string> {
        const token = await this.storage.fetch<TokenStore>(this.KEY);
        if (!token || !token.access_token) {
            this.logger.log("No token found, generating new one...");
            const newToken = await this.generateToken();
            return newToken.access_token;
        }

        try {
            const res = await firstValueFrom(
                this.httpService.get(`${this.config.url}/cek`, {
                    headers: {
                        "Authorization": `Bearer ${token.access_token}`
                    }
                })
            );

            if (res.status > 200) {
                if (token.refresh_token) {
                    const refreshedToken = await this.refreshToken();
                    return refreshedToken.access_token;
                }
            }
        } catch (e) {
            this.logger.warn("Token validation failed or refresh needed...");
            // if (token.refresh_token) {
            //     try {
            //         const refreshedToken = await this.refreshToken();
            //         return refreshedToken.access_token;
            //     } catch (innerE) {
            //         const newToken = await this.generateToken();
            //         return newToken.access_token;
            //     }
            // } else {
            //     const newToken = await this.generateToken();
            //     return newToken.access_token;
            // }
        }

        return token!.access_token;
    }

    private async generateToken(): Promise<any> {
        try {
            const res = await firstValueFrom(
                this.httpService.post(`${this.config.url}/generate-token`, null, {
                    headers: {
                        "x-nexus-lms-bo": this.config.key,
                        "server-id": this.config.id
                    }
                })
            );

            await this.storage.store<TokenStore>({
                access_token: res.data.access_token,
                refresh_token: res.data.refresh_token
            }, this.KEY);

            return res.data;
        } catch (e) {
            this.logger.error("Failed to generate token from backoffice", e);
            throw e;
        }
    }

    private async refreshToken(): Promise<any> {
        const token = await this.storage.fetch<TokenStore>(this.KEY);

        if (!token?.refresh_token) {
            throw new Error("refresh_token is missing in storage");
        }

        console.log(token.refresh_token)

        const res = await firstValueFrom(
            this.httpService.post(`${this.config.url}/refresh-token`,
                {
                    refresh_token: token.refresh_token
                },
                {
                    headers: {
                        "x-nexus-lms-bo": this.config.key,
                        "server-id": this.config.id
                    }
                }
            ));

        await this.storage.store<TokenStore>({
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token
        }, this.KEY);

        return res.data;
    }

    private letterToNumber(letter: string): number {
        return letter.toUpperCase().charCodeAt(0) - 64;
    }

    private parseMysqlDatetime(value: string): Date {
        return new Date(value.replace(' ', 'T'));
    }
}
