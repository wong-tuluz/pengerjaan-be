import { Inject, Injectable } from '@nestjs/common';
import { READ_DB } from '../../../config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { materiSoalTable } from '../../../infra/drizzle/schema';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class MateriSoalQueryService {
    constructor(@Inject(READ_DB) private readonly db: MySql2Database) {}

    async getByPaketSoalId(paketSoalId: string): Promise<
        {
            id: string;
            paketSoalId: string;
            title: string;
            description: string | null;
            order: number;
            timeLimit: number;
            createdAt: Date;
            updatedAt: Date | null;
        }[]
    > {
        return this.db
            .select()
            .from(materiSoalTable)
            .where(eq(materiSoalTable.paketSoalId, paketSoalId))
            .orderBy(asc(materiSoalTable.order));
    }

    async getById(id: string): Promise<{
        id: string;
        paketSoalId: string;
        title: string;
        description: string | null;
        order: number;
        timeLimit: number;
        createdAt: Date;
        updatedAt: Date | null;
    } | null> {
        const rows = await this.db
            .select()
            .from(materiSoalTable)
            .where(eq(materiSoalTable.id, id))
            .limit(1);

        return rows[0] ?? null;
    }
}
