import { Inject, Injectable } from '@nestjs/common';
import { READ_DB } from '../../../config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import {
    agendaSiswaTable,
    agendaTable,
    jadwalTable,
} from '../../../infra/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AgendaQueryService {
    constructor(
        @Inject(READ_DB) private readonly db: MySql2Database,
    ) {}

    public async getAll(siswaId: string): Promise<
        {
            id: string;
            title: string;
            date: Date;
            description: string | null;
            createdAt: Date;
            updatedAt: Date | null;
        }[]
    > {
        const rows = await this.db
            .select({
                agenda: agendaTable,
                agendaSiswa: agendaSiswaTable,
            })
            .from(agendaSiswaTable)
            .innerJoin(
                agendaTable,
                eq(agendaTable.id, agendaSiswaTable.agendaId),
            )
            .where(eq(agendaSiswaTable.siswaId, siswaId));

        const agendaSiswa = rows.map((r) => r.agenda);
        return agendaSiswa;
    }

    public async getById(agendaId: string): Promise<{
        id: string;
        title: string;
        date: Date;
        description: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        jadwal: Array<{
            id: string;
            agendaId: string;
            paketSoalId: string;
            startTime: Date;
            endTime: Date;
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
}
