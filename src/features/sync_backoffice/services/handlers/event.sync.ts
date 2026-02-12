import { Injectable } from "@nestjs/common";
import { AgendaService } from "../../../event/agenda/service/agenda.service";
import { JadwalService } from "../../../event/jadwal/services/jadwal.service";
import { MateriSoalService } from "../../../persoalan/materi/materi-soal.service";
import { PaketSoalService } from "../../../persoalan/paket/paket-soal.service";
import { SoalService } from "../../../persoalan/soal/soal.service";
import { BackofficeService } from "../backoffice.service";
import { SiswaService } from "../../../siswa/services/siswa.service";
import { SettingService } from "../../../settings/settings.controller";

const SYNC_KEY = "event_sync"

@Injectable()
export class EventSyncHandler {
    constructor(
        private readonly service: BackofficeService,
        private readonly agendaService: AgendaService,
        private readonly jadwalService: JadwalService,
        private readonly paketSoalService: PaketSoalService,
        private readonly materiService: MateriSoalService,
        private readonly soalService: SoalService,
        private readonly siswaService: SiswaService,
        private readonly storage: SettingService
    ) { }

    async handle(eventId: string) {
        const event = await this.service.fetchEventDetail(eventId);

        const syncedEvent = await this.storage.fetch<string[]>(SYNC_KEY) || []
        syncedEvent.push(event.id)

        await this.storage.store<string[]>(syncedEvent, SYNC_KEY)

        const agenda = await this.agendaService.create({
            title: event.nama_event,
            startTime: this.parseMysqlDatetime(event.mulai.toString()),
            endTime: this.parseMysqlDatetime(event.selesai.toString()),
        });


        for (const jadwal of event.jadwal) {

            console.log(jadwal);
            const paketSoal = await this.paketSoalService.create({
                title: jadwal.paket_soal.nama_paket_soal,
                description: '',
            });

            for (const materi of jadwal.paket_soal.materi) {
                const materiSoal = await this.materiService.create({
                    paketSoalId: paketSoal.id,
                    title: materi.nama_materi,
                    order: materi.urutan,
                    timeLimit: materi.waktu || 0
                });

                for (const soal of materi.soal) {
                    console.log(soal);
                    await this.soalService.create({
                        materiSoalId: materiSoal.id,
                        prompt: soal.soal,
                        type: "single-choice",
                        order: soal.nomor_soal,
                        weightCorrect: soal.bobot_benar,
                        weightWrong: soal.bobot_salah,
                        jawaban: soal.pilihan_jawaban.map(jw => ({
                            value: jw.isi_opsi,
                            isCorrect: jw.kunci_opsi == soal.kunci_jawaban,
                            order: this.letterToNumber(jw.nama_opsi),
                        })),
                    });
                }
            }

            await this.jadwalService.create({
                agendaId: agenda.id,
                paketSoalId: paketSoal.id,
                title: jadwal.nama_jadwal,
                token: jadwal.token,
                startTime: this.parseMysqlDatetime(jadwal.mulai.toString()),
                endTime: this.parseMysqlDatetime(jadwal.selesai.toString()),
                timeLimit: jadwal.paket_soal.waktu,
                attempts: 1
            });
        }


        for (const peserta of event.peserta) {
            const siswa = await this.siswaService.create({
                nis: peserta.nis,
                name: peserta.nama_siswa,
                birthDate: this.parseMysqlDatetime(peserta.tgl_lahir.toString()),
                kelas: peserta.nama_kelas,
                username: peserta.username,
                password: peserta.password,
            });

            this.agendaService.addSiswa(agenda.id, siswa.id);
        }
    }

    private letterToNumber(letter: string): number {
        return letter.toUpperCase().charCodeAt(0) - 64;
    }

    private parseMysqlDatetime(value: string): Date {
        // "2026-01-26 08:00:00" -> "2026-01-26T08:00:00"
        return new Date(value.replace(' ', 'T'));
    }
}