import { Injectable } from '@nestjs/common';
import { materiSoalTable } from '../../../infra/drizzle/schema';
import { eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { TransactionManager } from '../../../infra/drizzle/transaction-manager';

@Injectable()
export class MateriSoalService {
    constructor(private readonly txm: TransactionManager) {}

    public async create(input: {
        paketSoalId: string;
        title: string;
        description?: string | null;
        order: number;
        timeLimit: number;
    }): Promise<{ id: string }> {
        const id = uuidv7();

        await this.txm.run(async (ctx) => {
            await ctx.tx.insert(materiSoalTable).values({
                id,
                paketSoalId: input.paketSoalId,
                title: input.title,
                description: input.description ?? null,
                order: input.order,
                timeLimit: input.timeLimit,
            });
        });

        return { id };
    }

    public async update(
        id: string,
        input: {
            title?: string;
            description?: string | null;
            order?: number;
            timeLimit?: number;
        },
    ): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
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
        });
    }

    public async delete(id: string): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
                .delete(materiSoalTable)
                .where(eq(materiSoalTable.id, id));
        });
    }
}
