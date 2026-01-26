import { Inject, Injectable } from "@nestjs/common";
import { eq, inArray, count, and } from "drizzle-orm";
import { agendaSiswaTable, workSessionTable, agendaTable, jadwalTable, paketSoalTable, soalTable, materiSoalTable } from "../../../infra/drizzle/schema";
import { READ_DB } from "../../../config/db.constants";
import { MySql2Database } from "drizzle-orm/mysql2";

@Injectable()
export class JadwalQueryService {
    constructor(
        @Inject(READ_DB) private readonly db: MySql2Database,
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
            .limit(1)
            .then((rows) => rows[0]);

        return row ?? null;
    }

    public async getAllJadwal(siswaId?: string) {
        const queryRows = await this.db
            .select({ agenda: agendaTable, jadwal: jadwalTable })
            .from(jadwalTable)
            .leftJoin(agendaTable, eq(agendaTable.id, jadwalTable.agendaId))
            .leftJoin(agendaSiswaTable, eq(agendaSiswaTable.agendaId, agendaTable.id))
            .where(siswaId ? eq(agendaSiswaTable.siswaId, siswaId) : undefined);

        if (queryRows.length === 0) return [];

        const jadwalIds = queryRows.map(r => r.jadwal.id);
        const paketSoalIds = [...new Set(queryRows.map(r => r.jadwal.paketSoalId))];

        const [allSessions, allPaketSoal, allCounts] = await Promise.all([
            this.db.select().from(workSessionTable).where(and(
                inArray(workSessionTable.jadwalId, jadwalIds),
                siswaId ? eq(workSessionTable.siswaId, siswaId) : undefined
            )),
            this.db.select().from(paketSoalTable).where(inArray(paketSoalTable.id, paketSoalIds)),
            this.db.select({
                paketSoalId: materiSoalTable.paketSoalId,
                cnt: count()
            }).from(soalTable)
                .innerJoin(materiSoalTable, eq(soalTable.materiSoalId, materiSoalTable.id))
                .where(inArray(materiSoalTable.paketSoalId, paketSoalIds))
                .groupBy(materiSoalTable.paketSoalId)
        ]);

        const sessionsByJadwal = new Map<string, typeof allSessions>();
        for (const s of allSessions) {
            const list = sessionsByJadwal.get(s.jadwalId) || [];
            list.push(s);
            sessionsByJadwal.set(s.jadwalId, list);
        }

        const paketSoalMap = new Map<string, typeof allPaketSoal[0]>();
        for (const p of allPaketSoal) {
            paketSoalMap.set(p.id, p);
        }

        const countsMap = new Map<string, number>();
        for (const c of allCounts) {
            countsMap.set(c.paketSoalId, c.cnt);
        }

        return queryRows.map((row) => {
            const sessions = sessionsByJadwal.get(row.jadwal.id) || [];
            const paketSoal = paketSoalMap.get(row.jadwal.paketSoalId);
            const questionCount = countsMap.get(row.jadwal.paketSoalId) || 0;

            return {
                jadwalId: row.jadwal.id,
                startTime: row.jadwal.startTime,
                endTime: row.jadwal.endTime,
                timeLimit: row.jadwal.timeLimit,
                attempts: row.jadwal.attempts,
                attemptsRemaining: row.jadwal.attempts - sessions.length,
                status: sessions.length > 0 ? 'attempted' : 'no-attempts',
                questionCount,
                agenda: row.agenda,
                paketSoal: paketSoal ?? null
            };
        });
    }
}