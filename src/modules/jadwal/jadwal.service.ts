import { Injectable, NotFoundException } from "@nestjs/common";
import { db, agendaSiswaTable, jadwalTable, materiSoalTable, soalTable, workSessionTable } from "src/common/db";
import { and, eq, exists } from "drizzle-orm";
import { AgendaService } from "../agenda/agenda.service";
import { PaketSoalService } from "../paket-soal/paket-soal.service";
import { SettingService } from "../settings/settings.service";

@Injectable()
export class JadwalService {
    constructor(
        private readonly agendaService: AgendaService,
        private readonly paketsoalService: PaketSoalService,
        private readonly settings: SettingService
    ) { }

    async listAll(filter?: {
        siswaId?: string,
        agendaId?: string,
    }) {
        const rows = await db.select()
            .from(jadwalTable)
            .where(and(...[
                filter?.agendaId ? eq(jadwalTable.agendaId, filter.agendaId) : undefined,
                filter?.siswaId ? exists(db
                    .select()
                    .from(agendaSiswaTable)
                    .where(and(
                        eq(agendaSiswaTable.siswaId, filter.siswaId),
                        eq(agendaSiswaTable.agendaId, jadwalTable.agendaId),
                    )),
                ) : undefined
            ]))

        return Promise.all(rows.map(async row => {
            const questionCount = await this.getQuestionCount(row.paketSoalId)
            const attemptCount = filter?.siswaId ? await this.getAttemptedCount(filter.siswaId, row.id) : 0
            const agenda = await this.agendaService.findById(row.agendaId)
            const paketsoal = await this.paketsoalService.findById(row.paketSoalId)
            const hasil = await this.showHasil()

            return {
                ...row,
                jadwalId: row.id,
                questionCount,
                attemptsRemaining: row.attempts - attemptCount,
                status: attemptCount > 0 ? 'attempted' : 'no-attempts',
                viewHasil: hasil,
                agenda: agenda,
                paketSoal: paketsoal,
            }
        }))
    }

    private async showHasil(): Promise<boolean> {
        return (await this.settings.fetch<{ showHasil: boolean }>())?.showHasil ?? false
    }

    private async getQuestionCount(paketSoalId: string) {
        const rows = await db.select().from(soalTable)
            .innerJoin(materiSoalTable, eq(soalTable.materiSoalId, materiSoalTable.id))
            .where(eq(materiSoalTable.paketSoalId, paketSoalId));

        return rows.length
    }

    private async getAttemptedCount(siswaId: string, jadwalId: string): Promise<number> {
        const rows = await db.select().from(workSessionTable)
            .where(and(
                eq(workSessionTable.jadwalId, jadwalId),
                eq(workSessionTable.siswaId, siswaId),
                eq(workSessionTable.status, 'finished'),
            ))

        return rows.length
    }

    async findById(jadwalId: string) {
        const row = await db.select().from(jadwalTable).where(eq(jadwalTable.id, jadwalId)).limit(1).then(rows => rows[0])
        if (!row) throw new NotFoundException();

        return row;
    }

    async save(data: {
        id?: string,
        agendaId: string,
        paketSoalId: string,
        title: string,
        startTime: Date,
        endTime: Date,
        timeLimit: number,
        attempts: number,
        token: string,
        remoteId?: string,
    }) {
        const id = data.id ?? crypto.randomUUID();
        const payload = {
            id,
            ...data,
        };

        await db.insert(jadwalTable).values(payload).onDuplicateKeyUpdate({
            set: {
                agendaId: payload.agendaId,
                paketSoalId: payload.paketSoalId,
                title: payload.title,
                startTime: payload.startTime,
                endTime: payload.endTime,
                timeLimit: payload.timeLimit,
                attempts: payload.attempts,
                token: payload.token,
                remoteId: payload.remoteId,
                updatedAt: new Date(),
            }
        });
        
        return payload;
    }

    async delete(jadwalId: string) {
        await db.delete(jadwalTable).where(eq(jadwalTable.id, jadwalId));
    }

    getTimeLimit(jadwal: { timeLimit: number, endTime: Date }, date: Date): number {
        const expiresAt = date.getTime() + jadwal.timeLimit * 60 * 1000

        let res = 0
        if (new Date(expiresAt) < jadwal.endTime) {
            res = (expiresAt - new Date().getTime()) / 1000 / 60
        } else {
            res = (jadwal.endTime.getTime() - new Date().getTime()) / 1000 / 60
        }

        return res
    }
}