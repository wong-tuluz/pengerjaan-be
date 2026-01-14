import { Inject, Injectable } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { agendaSiswaTable, workSessionTable, agendaTable, jadwalTable, paketSoalTable } from "../../../infra/drizzle/schema";
import { AgendaQueryService } from "./agenda-query.service";
import { READ_DB } from "../../../config/db.constants";
import { MySql2Database } from "drizzle-orm/mysql2";
import { SessionQueryService } from "../../work-session/services/session-query.service";
import { PaketSoalQueryService } from "../../soal/services/paket-soal-query.service";

@Injectable()
export class JadwalQueryService {
    constructor(
        @Inject(READ_DB) private readonly db: MySql2Database,
        private readonly sessionQuery: SessionQueryService,
        private readonly paketSoalQuery: PaketSoalQueryService
    ) { }

    public async getById(jadwalId: string): Promise<{
        id: string;
        agendaId: string;
        paketSoalId: string;
        startTime: Date;
        endTime: Date;
        attempts: number;
        timeLimit: number
        createdAt: Date;
        updatedAt: Date | null;
    } | null> {
        const row = await this.db
            .select()
            .from(jadwalTable)
            .where(eq(jadwalTable.id, jadwalId))
            .then((rows) => rows[0]);

        return row ?? null;
    }

    public async getAllJadwal(siswaId?: string) {

        const rows = await this.db
            .select({ agenda: agendaTable, jadwal: jadwalTable })
            .from(jadwalTable)
            .leftJoin(agendaTable, eq(agendaTable.id, jadwalTable.agendaId))
            .leftJoin(agendaSiswaTable, eq(agendaSiswaTable.agendaId, agendaTable.id))
            .where(siswaId ? eq(agendaSiswaTable.siswaId, siswaId) : undefined)


        const res = new Array<any>
        for (const row of rows) {
            const sessions = await this.sessionQuery.getSessions(siswaId, row.jadwal.id)
            const paketSoal = await this.paketSoalQuery.getById(row.jadwal.paketSoalId)

            const agenda = row.agenda


            res.push({
                jadwalId: row.jadwal.id,
                startTime: row.jadwal.startTime,
                endTime: row.jadwal.endTime,
                timeLimit: row.jadwal.timeLimit,
                attempts: row.jadwal.attempts,
                attemptsRemaining: row.jadwal.attempts - sessions.length,
                status: sessions.length > 0 ? 'attempted' : 'no-attempts',
                agenda,
                paketSoal

            })

            return res
        }
    }

}