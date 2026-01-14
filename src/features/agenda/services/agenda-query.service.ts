import { Inject, Injectable } from '@nestjs/common';
import { READ_DB } from '../../../config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import {
    agendaSiswaTable,
    agendaTable,
    jadwalTable,
    paketSoalTable,
} from '../../../infra/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { title } from 'process';

@Injectable()
export class AgendaQueryService {
    constructor(
        @Inject(READ_DB) private readonly db: MySql2Database,
    ) { }

    public async getAll(siswaId?: string): Promise<
        {
            id: string;
            title: string;
            startTime: Date;
            endTime: Date;
            description: string | null;
            createdAt: Date;
            updatedAt: Date | null;
        }[]
    > {
        const rows = await this.db
            .select({
                agenda: agendaTable,
                agendaSiswa: agendaSiswaTable,
                jadwal: jadwalTable,
            })
            .from(agendaSiswaTable)
            .innerJoin(
                agendaTable,
                eq(agendaTable.id, agendaSiswaTable.agendaId),
            )
            .leftJoin(jadwalTable, eq(jadwalTable.agendaId, agendaTable.id))
            .where(and(
                siswaId ? eq(agendaSiswaTable.siswaId, siswaId) : undefined
            ));

        const agendaSiswa = rows.map((r) => r.agenda);

        return agendaSiswa;
    }

    public async getById(agendaId: string): Promise<{
        id: string;
        title: string;
        startTime: Date;
        endTime: Date;
        description: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        jadwal: Array<{
            id: string;
            agendaId: string;
            paketSoalId: string;
            startTime: Date;
            endTime: Date;
            attempts: number;
            createdAt: Date;
            updatedAt: Date | null;
        }>;
    } | null> {
        const rows = await this.db
            .select({
                agenda: agendaTable,
                jadwal: jadwalTable,
            })
            .from(agendaTable)
            .leftJoin(jadwalTable, eq(jadwalTable.agendaId, agendaTable.id))
            .where(eq(agendaTable.id, agendaId));

        if (rows.length === 0) return null;

        const agenda = rows[0].agenda;

        return {
            ...agenda,
            jadwal: rows.filter((r) => r.jadwal !== null).map((r) => r.jadwal!),
        };
    }

    public async getJadwal(jadwalId: string): Promise<{
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

    public async getAllJadwal() {
        const row = await this.db
            .select({agenda: agendaTable, jadwal: jadwalTable, paketSoal: paketSoalTable})
            .from(jadwalTable)
            .leftJoin(agendaTable, eq(agendaTable.id, jadwalTable.agendaId))
            .leftJoin(paketSoalTable, eq(paketSoalTable.id, jadwalTable.paketSoalId))
            .then((rows) => rows.map(row => {
                jadwal:  {
                    id: row.jadwal.id
                    startTime: row.jadwal.startTime
                    endTime: row.jadwal.endTime
                    timeLimit: row.jadwal.timeLimit
                    attempts: row.jadwal.attempts
                }
                agenda: {
                    id: row.agenda?.id
                    title: row.agenda?.title
                    startTime: row.agenda?.startTime
                    endTime: row.agenda?.endTime
                }
                paketSoal: {
                    id: row.paketSoal?.id
                    title: row.paketSoal?.title
                }
            }));

        return row ?? null;
    }

    public async getPeserta(agendaId: string): Promise<{
        id: string;
        agendaId: string;
        siswaId: string;
        createdAt: Date;
        updatedAt: Date | null;
    }[]> {
        const rows = await this.db.select().from(agendaSiswaTable).where(eq(agendaSiswaTable.agendaId, agendaId))
        return rows
    }
}
