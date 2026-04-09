import { Injectable, NotFoundException } from '@nestjs/common';
import { db, materiSoalTable } from 'src/common/db';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class MateriService {
    constructor() { }

    async save(input: {
        id?: string;
        paketSoalId: string;
        title: string;
        description?: string | null;
        order: number;
        timeLimit: number;
        remoteId?: string | null;
    }) {
        const id = input.id ?? crypto.randomUUID();
        const payload = {
            id,
            remoteId: input.remoteId,
            paketSoalId: input.paketSoalId,
            title: input.title,
            description: input.description ?? null,
            order: input.order,
            timeLimit: input.timeLimit,
        };

        await db.insert(materiSoalTable).values(payload).onDuplicateKeyUpdate({
            set: {
                remoteId: payload.remoteId,
                paketSoalId: payload.paketSoalId,
                title: payload.title,
                description: payload.description,
                order: payload.order,
                timeLimit: payload.timeLimit,
                updatedAt: new Date(),
            }
        });

        return { id };
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
