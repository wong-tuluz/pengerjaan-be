import { Injectable, BadRequestException } from '@nestjs/common';
import { soalTable, jawabanSoalTable } from '../../../infra/drizzle/schema';
import { v7 as uuidv7 } from 'uuid';
import { TransactionManager } from '../../../infra/drizzle/transaction-manager';
import { SoalType } from '../domain/soal';
import { eq } from 'drizzle-orm';

@Injectable()
export class SoalService {
    constructor(private readonly txm: TransactionManager) {}

    public async create(input: {
        materiSoalId: string;
        type: SoalType;
        prompt: string;
        order: number;
        weightCorrect: number;
        weightWrong: number;
        jawaban?: Array<{
            value: string;
            isCorrect: boolean;
            order: number;
        }>;
    }): Promise<{ id: string }> {
        if (input.type === 'essay' && input.jawaban?.length) {
            throw new BadRequestException('Essay soal must not have jawaban');
        }

        const soalId = uuidv7();

        await this.txm.run(async (ctx) => {
            await ctx.tx.insert(soalTable).values({
                id: soalId,
                materiSoalId: input.materiSoalId,
                type: input.type,
                prompt: input.prompt,
                order: input.order,
                weightCorrect: input.weightCorrect,
                weightWrong: input.weightWrong,
            });

            if (input.jawaban?.length) {
                await ctx.tx.insert(jawabanSoalTable).values(
                    input.jawaban.map((j) => ({
                        id: uuidv7(),
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

    public async update(
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
    ): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
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
                await ctx.tx
                    .delete(jawabanSoalTable)
                    .where(eq(jawabanSoalTable.soalId, soalId));

                if (input.jawaban.length > 0) {
                    await ctx.tx.insert(jawabanSoalTable).values(
                        input.jawaban.map((j) => ({
                            id: uuidv7(),
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

    public async delete(soalId: string): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
                .delete(jawabanSoalTable)
                .where(eq(jawabanSoalTable.soalId, soalId));

            await ctx.tx.delete(soalTable).where(eq(soalTable.id, soalId));
        });
    }
}
