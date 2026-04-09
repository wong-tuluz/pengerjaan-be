import { Injectable, NotFoundException } from '@nestjs/common';
import { db, materiSoalTable } from 'src/common/db';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class MateriService {
    constructor() { }

    async create(input: {
        paketSoalId: string;
        title: string;
        description?: string | null;
        order: number;
        timeLimit: number;
        remoteId?: string;
    }) {
        const id = crypto.randomUUID();

        await db.insert(materiSoalTable).values({
            id,
            remoteId: input.remoteId,
            paketSoalId: input.paketSoalId,
            title: input.title,
            description: input.description ?? null,
            order: input.order,
            timeLimit: input.timeLimit,
        });

        return { id };
    }

    async update(
        id: string,
        input: {
            title?: string;
            description?: string | null;
            order?: number;
            timeLimit?: number;
        },
    ) {
        await db
            .update(materiSoalTable)
            .set({
                ...(input.title && { title: input.title }),
                ...(input.description !== undefined && {
                    description: input.description,
                }),
                ...(input.order !== undefined && { order: input.order }),
                ...(input.timeLimit !== undefined && {
                    timeLimit: input.timeLimit,
                }),
            })
            .where(eq(materiSoalTable.id, id));
    }

    async delete(id: string) {
        await db
            .delete(materiSoalTable)
            .where(eq(materiSoalTable.id, id));
    }

    async findByPaketSoalId(paketSoalId: string) {
        return db
            .select()
            .from(materiSoalTable)
            .where(eq(materiSoalTable.paketSoalId, paketSoalId))
            .orderBy(asc(materiSoalTable.order));
    }

    async findById(id: string) {
        const rows = await db
            .select()
            .from(materiSoalTable)
            .where(eq(materiSoalTable.id, id))
            .limit(1);

        const result = rows[0] ?? null;
        if (!result) {
            throw new NotFoundException('Materi soal not found');
        }
        return result;
    }
}
