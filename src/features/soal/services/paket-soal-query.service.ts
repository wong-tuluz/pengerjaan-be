import { Inject, Injectable } from '@nestjs/common';
import { READ_DB } from '../../../config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { materiSoalTable, paketSoalTable, soalTable } from '../../../infra/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PaketSoalQueryService {
    constructor(@Inject(READ_DB) private readonly db: MySql2Database) { }

    async getAll(): Promise<
        {
            id: string;
            title: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date | null;
        }[]
    > {
        return this.db.select().from(paketSoalTable);
    }

    async getById(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date | null;
    } | null> {
        const row = await this.db
            .select()
            .from(paketSoalTable)
            .where(eq(paketSoalTable.id, id))
            .limit(1)
            .then((rows) => rows[0]);

        return row || null;
    }

    async getQuestionCount(id: string): Promise<number> {
        const count = await this.db
            .select()
            .from(soalTable)
            .leftJoin(materiSoalTable, eq(soalTable.materiSoalId, materiSoalTable.id))
            .where(eq(materiSoalTable.paketSoalId, id))
            .then((rows) => rows.length);

        return count;
    }
}
