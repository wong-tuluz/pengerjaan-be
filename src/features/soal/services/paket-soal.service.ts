import { Injectable } from '@nestjs/common';
import { paketSoalTable } from '../../../infra/drizzle/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { TransactionManager } from '../../../infra/drizzle/transaction-manager';

@Injectable()
export class PaketSoalService {
    constructor(private readonly txm: TransactionManager) {}

    public async create(input: {
        title: string;
        description?: string | null;
    }): Promise<{ id: string }> {
        const id = randomUUID();

        await this.txm.run(async (ctx) => {
            await ctx.tx.insert(paketSoalTable).values({
                id,
                title: input.title,
                description: input.description ?? null,
            });
        });

        return { id };
    }

    public async update(
        id: string,
        input: {
            title?: string;
            description?: string | null;
            timeLimit?: number;
        },
    ): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
                .update(paketSoalTable)
                .set({
                    ...(input.title && { title: input.title }),
                    ...(input.description !== undefined && {
                        description: input.description,
                    }),
                    ...(input.timeLimit !== undefined && {
                        timeLimit: input.timeLimit,
                    }),
                })
                .where(eq(paketSoalTable.id, id));
        });
    }

    public async delete(id: string): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
                .delete(paketSoalTable)
                .where(eq(paketSoalTable.id, id));
        });
    }
}
