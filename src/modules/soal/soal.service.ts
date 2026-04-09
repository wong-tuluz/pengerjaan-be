import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { db, soalTable, jawabanSoalTable } from 'src/common/db';
import { eq, asc } from 'drizzle-orm';

export type SoalType = 'multiple-choice' | 'essay' | 'single-choice';

@Injectable()
export class SoalService {
    constructor() { }

    async create(input: {
        id?: string;
        materiSoalId: string;
        type: SoalType;
        prompt: string;
        order: number;
        weightCorrect: number;
        weightWrong: number;
        remoteId?: string;
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

        await db.transaction(async (tx) => {
            await tx.insert(soalTable).values({
                id: soalId,
                remoteId: input.remoteId,
                materiSoalId: input.materiSoalId,
                type: input.type,
                prompt: input.prompt,
                order: input.order,
                weightCorrect: input.weightCorrect,
                weightWrong: input.weightWrong,
            });

            if (input.jawaban?.length) {
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
        });

        return { id: soalId };
    }

    async update(
        soalId: string,
        input: {
            prompt?: string;
            order?: number;
            weightCorrect?: number;
            weightWrong?: number;
            jawaban?: Array<{
                value: string;
                isCorrect: boolean;
                order: number;
            }>;
        },
    ) {
        await db.transaction(async (tx) => {
            await tx
                .update(soalTable)
                .set({
                    ...(input.prompt && { prompt: input.prompt }),
                    ...(input.order !== undefined && { order: input.order }),
                    ...(input.weightCorrect !== undefined && {
                        weightCorrect: input.weightCorrect,
                    }),
                    ...(input.weightWrong !== undefined && {
                        weightWrong: input.weightWrong,
                    }),
                })
                .where(eq(soalTable.id, soalId));

            if (input.jawaban) {
                await tx
                    .delete(jawabanSoalTable)
                    .where(eq(jawabanSoalTable.soalId, soalId));

                if (input.jawaban.length > 0) {
                    await tx.insert(jawabanSoalTable).values(
                        input.jawaban.map((j) => ({
                            id: crypto.randomUUID(),
                            soalId,
                            value: j.value,
                            isCorrect: j.isCorrect,
                            order: j.order,
                        })),
                    );
                }
            }
        });
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
