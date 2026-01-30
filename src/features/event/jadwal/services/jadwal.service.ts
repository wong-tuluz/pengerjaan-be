import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { READ_DB, WRITE_DB } from "../../../../common/config/db.constants";
import { agendaSiswaTable, jadwalTable, materiSoalTable, soalTable, workSessionTable } from "../../../../infra/drizzle/schema";
import { and, eq, exists } from "drizzle-orm";
import { Jadwal } from "../domain/jadwal";
import { AgendaService } from "../../agenda/service/agenda.service";
import { Agenda } from "../../agenda/domain/agenda";

@Injectable()
export class JadwalService {
    constructor(
        @Inject(READ_DB) private readonly rdb: MySql2Database,
        @Inject(WRITE_DB) private readonly db: MySql2Database,
        private readonly agendaService: AgendaService,
    ) { }

    async listAll(filter?: {
        siswaId: string,
        agendaId: string,
    }): Promise<(Jadwal & {
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

            return Object.assign(jadwal, {
                questionCount,
                attemptsRemaining: jadwal.attempts - attemptCount,
                status: attemptCount > 0 ? 'attempted' : 'no-attempts',
                agenda: agenda
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
                eq(workSessionTable.siswaId, siswaId)
            ))

        return rows.length
    }

    async findById(jadwalId: string) {
        const row = await this.rdb.select().from(jadwalTable).where(eq(jadwalTable.id, jadwalId)).then(rows => rows[0])
        if (!row) throw new NotFoundException();

        return new Jadwal(row)
    }
}