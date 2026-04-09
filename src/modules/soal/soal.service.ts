import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { db, soalTable, jawabanSoalTable } from 'src/common/db';
import { eq, asc } from 'drizzle-orm';

export type SoalType = 'multiple-choice' | 'essay' | 'single-choice';

@Injectable()
export class SoalService {
    constructor() { }

    async save(input: {
        id?: string;
        materiSoalId: string;
        type: SoalType;
        prompt: string;
        order: number;
        weightCorrect: number;
        weightWrong: number;
        remoteId?: string | null;
        jawaban?: Array<{
            id?: string;
            value: string;
            isCorrect: boolean;
            order: number;
        }>;
    }) {
        if (input.type === 'essay' && input.jawaban?.length) {
            throw new BadRequestException('Essay soal must not have jawaban');
        }

        const soalId = input.id ?? crypto.randomUUID();
        const payload = {
            id: soalId,
            remoteId: input.remoteId,
            materiSoalId: input.materiSoalId,
            type: input.type,
            prompt: input.prompt,
            order: input.order,
            weightCorrect: input.weightCorrect,
            weightWrong: input.weightWrong,
        };

        await db.transaction(async (tx) => {
            await tx.insert(soalTable).values(payload).onDuplicateKeyUpdate({
                set: {
                    remoteId: payload.remoteId,
                    materiSoalId: payload.materiSoalId,
                    type: payload.type,
                    prompt: payload.prompt,
                    order: payload.order,
                    weightCorrect: payload.weightCorrect,
                    weightWrong: payload.weightWrong,
                    updatedAt: new Date(),
                }
            });

            if (input.jawaban) {
                // For simplified sync, we often replace siblings or update them if IDs are provided.
                // To keep it simple and consistent with previous "update" logic:
                // If we have IDs for jawaban, we CAN upsert them too.
                // But typically for a "save" of a parent with children, we want the children list to match exactly.
                
                // If we use IDs from remote, we should probably NOT delete all first if we want to preserve them.
                // However, the previous "update" deleted all. 
                // Let's use a more robust "delete ones not in list" or just "delete all and re-insert" if no IDs are provided.
                
                // Given we are syncing and provide IDs:
                await tx.delete(jawabanSoalTable).where(eq(jawabanSoalTable.soalId, soalId));
                
                if (input.jawaban.length > 0) {
                    await tx.insert(jawabanSoalTable).values(
                        input.jawaban.map((j) => ({
                            id: j.id ?? crypto.randomUUID(),
                            soalId,
                            value: j.value,
                            isCorrect: j.isCorrect,
                            order: j.order,
                        })),
                    );
                }
            }
        });

        return { id: soalId };
    }

    async delete(soalId: string) {
        await db.transaction(async (tx) => {
            await tx
                .delete(jawabanSoalTable)
                .where(eq(jawabanSoalTable.soalId, soalId));

            await tx.delete(soalTable).where(eq(soalTable.id, soalId));
        });
    }

    async findByMateriSoalId(materiSoalId: string) {
        return db
            .select()
            .from(soalTable)
            .where(eq(soalTable.materiSoalId, materiSoalId))
            .orderBy(asc(soalTable.order));
    }

    async findById(id: string) {
        const rows = await db
            .select()
            .from(soalTable)
            .where(eq(soalTable.id, id))
            .limit(1);

        return rows[0] ?? null;
    }

    async findByIdWithJawaban(soalId: string) {
        const rows = await db
            .select({
                soal: soalTable,
                jawaban: jawabanSoalTable,
            })
            .from(soalTable)
            .leftJoin(
                jawabanSoalTable,
                eq(jawabanSoalTable.soalId, soalTable.id),
            )
            .where(eq(soalTable.id, soalId))
            .orderBy(asc(jawabanSoalTable.order));

        if (rows.length === 0) return null;

        return {
            ...rows[0].soal,
            jawaban: rows
                .filter((r) => r.jawaban !== null)
                .map((r) => r.jawaban!),
        };
    }

    async getJawaban(soalId: string) {
        return db
            .select()
            .from(jawabanSoalTable)
            .where(eq(jawabanSoalTable.soalId, soalId))
            .orderBy(asc(jawabanSoalTable.order));
    }
}
