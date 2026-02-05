import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { READ_DB, WRITE_DB } from "../../../../common/config/db.constants";
import { agendaSiswaTable, jadwalTable, materiSoalTable, session, soalTable, workSessionTable } from "../../../../infra/drizzle/schema";
import { and, eq, exists, isNull } from "drizzle-orm";
import { Jadwal } from "../domain/jadwal";
import { AgendaService } from "../../agenda/service/agenda.service";
import { Agenda } from "../../agenda/domain/agenda";
import { PaketSoalService } from "../../../persoalan/paket/paket-soal.service";
import { PaketSoalQueryService } from "../../../persoalan/paket/paket-soal-query.service";

@Injectable()
export class JadwalService {
    constructor(
        @Inject(READ_DB) private readonly rdb: MySql2Database,
        @Inject(WRITE_DB) private readonly db: MySql2Database,
        private readonly agendaService: AgendaService,
        private readonly paketsoalService: PaketSoalQueryService,
    ) { }

    async listAll(filter?: {
        siswaId?: string,
        agendaId?: string,
    }): Promise<(Omit<Jadwal, 'id'> & {
        jadwalId: string
        questionCount: number
        attemptsRemaining: number
        status: string
        agenda: Agenda
    })[]> {
        const rows = await this.rdb.select()
            .from(jadwalTable)
            .where(and(...[
                filter?.agendaId ? eq(jadwalTable.agendaId, filter.agendaId) : undefined,
                filter?.siswaId ? exists(this.rdb
                    .select()
                    .from(agendaSiswaTable)
                    .where(and(
                        eq(agendaSiswaTable.siswaId, filter.siswaId),
                        eq(agendaSiswaTable.agendaId, jadwalTable.agendaId),
                    )),
                ) : undefined
            ]))

        return Promise.all(rows.map(async row => {
            const jadwal = new Jadwal(row)

            const questionCount = await this.getQuestionCount(row.paketSoalId)
            const attemptCount = filter?.siswaId ? await this.getAttemptedCount(filter.siswaId, jadwal.id) : 0
            const agenda = await this.agendaService.findById(jadwal.agendaId)
            const paketsoal = await this.paketsoalService.getById(jadwal.paketSoalId)

            return Object.assign(jadwal, {
                jadwalId: jadwal.id,
                questionCount,
                attemptsRemaining: jadwal.attempts - attemptCount,
                status: attemptCount > 0 ? 'attempted' : 'no-attempts',
                agenda: agenda,
                paketSoal: paketsoal
            })
        }))
    }

    private async getQuestionCount(paketSoalId: string) {
        const rows = await this.rdb.select().from(soalTable)
            .innerJoin(materiSoalTable, eq(soalTable.materiSoalId, materiSoalTable.id))
            .where(eq(materiSoalTable.paketSoalId, paketSoalId))
            .then()

        return rows.length
    }

    private async getAttemptedCount(siswaId: string, jadwalId: string): Promise<number> {
        const rows = await this.rdb.select().from(workSessionTable)
            .where(and(
                eq(workSessionTable.jadwalId, jadwalId),
                eq(workSessionTable.siswaId, siswaId),
                eq(workSessionTable.status, 'finished'),
                
            ))

        return rows.length
    }

    async findById(jadwalId: string) {
        const row = await this.rdb.select().from(jadwalTable).where(eq(jadwalTable.id, jadwalId)).then(rows => rows[0])
        if (!row) throw new NotFoundException();

        return new Jadwal(row)
    }

    async upsert(jadwal: Jadwal) {
        await this.db
            .insert(jadwalTable)
            .values(jadwal)
            .onDuplicateKeyUpdate({
                set: {
                    agendaId: jadwal.agendaId,
                    paketSoalId: jadwal.paketSoalId,
                    title: jadwal.title,
                    startTime: jadwal.startTime,
                    endTime: jadwal.endTime,
                    timeLimit: jadwal.timeLimit,
                    attempts: jadwal.attempts,
                    token: jadwal.token,
                    updatedAt: new Date()
                }
            });
    }

    async create(data: {
        agendaId: string,
        paketSoalId: string,
        title: string,
        startTime: Date,
        endTime: Date,
        timeLimit: number,
        attempts: number,
        token: string,
    }) {
        const jadwal = Jadwal.create({
            agendaId: data.agendaId,
            paketSoalId: data.paketSoalId,
            title: data.title,
            startTime: data.startTime,
            endTime: data.endTime,
            timeLimit: data.timeLimit,
            attempts: data.attempts,
            token: data.token,
        })

        await this.db.insert(jadwalTable).values(jadwal)
    }

    async delete(jadwalId: string) {
        await this.db.delete(jadwalTable).where(eq(jadwalTable.id, jadwalId));
    }


}