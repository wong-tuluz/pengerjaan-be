import { Injectable, NotFoundException } from '@nestjs/common';
import { db, paketSoalTable, materiSoalTable, soalTable } from 'src/common/db';
import { eq, count } from 'drizzle-orm';

@Injectable()
export class PaketSoalService {
    constructor() { }

    async create(input: {
        id?: string;
        title: string;
        description?: string | null;
        remoteId?: string;
    }) {
        const id = input.id ?? crypto.randomUUID();

        await db.insert(paketSoalTable).values({
            id,
            remoteId: input.remoteId,
            title: input.title,
            description: input.description ?? null,
        });

        return { id };
    }

    async update(
        id: string,
        input: {
            title?: string;
            description?: string | null;
        },
    ) {
        await db
            .update(paketSoalTable)
            .set({
                ...(input.title && { title: input.title }),
                ...(input.description !== undefined && {
                    description: input.description,
                }),
            })
            .where(eq(paketSoalTable.id, id));
    }

    async delete(id: string) {
        await db
            .delete(paketSoalTable)
            .where(eq(paketSoalTable.id, id));
    }

    async findAll() {
        return db.select().from(paketSoalTable);
    }

    async findById(id: string) {
        const rows = await db
            .select()
            .from(paketSoalTable)
            .where(eq(paketSoalTable.id, id))
            .limit(1);

        const result = rows[0] ?? null;
        if (!result) {
            throw new NotFoundException('Paket soal not found');
        }
        return result;
    }

    async getQuestionCount(id: string) {
        const [result] = await db
            .select({ count: count() })
            .from(soalTable)
            .innerJoin(materiSoalTable, eq(soalTable.materiSoalId, materiSoalTable.id))
            .where(eq(materiSoalTable.paketSoalId, id));

        return result.count;
    }
}
