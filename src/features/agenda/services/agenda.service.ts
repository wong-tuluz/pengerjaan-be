import { Injectable } from '@nestjs/common';
import { TransactionManager } from '../../../infra/drizzle/transaction-manager';
import { v7 as uuidv7 } from 'uuid';
import { agendaTable, jadwalTable } from '../../../infra/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AgendaService {
    constructor(private readonly txm: TransactionManager) {}

    public async create(input: {
        title: string;
        date: Date;
        description?: string | null;
        jadwal?: Array<{
            paketSoalId: string;
            startTime: Date;
            endTime: Date;
        }>;
    }): Promise<{ id: string }> {
        const agendaId = uuidv7();

        await this.txm.run(async (ctx) => {
            await ctx.tx.insert(agendaTable).values({
                id: agendaId,
                title: input.title,
                date: input.date,
                description: input.description ?? null,
            });

            if (input.jadwal?.length) {
                await ctx.tx.insert(jadwalTable).values(
                    input.jadwal.map((j) => ({
                        id: uuidv7(),
                        agendaId,
                        paketSoalId: j.paketSoalId,
                        startTime: j.startTime,
                        endTime: j.endTime,
                    })),
                );
            }
        });

        return { id: agendaId };
    }

    public async updateAgenda(
        agendaId: string,
        input: {
            title?: string;
            date?: Date;
            description?: string | null;
            jadwal?: Array<{
                paketSoalId: string;
                startTime: Date;
                endTime: Date;
            }> | null;
        },
    ): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
                .update(agendaTable)
                .set({
                    ...(input.title && { title: input.title }),
                    ...(input.date && { date: input.date }),
                    ...(input.description !== undefined && {
                        description: input.description,
                    }),
                })
                .where(eq(agendaTable.id, agendaId));

            if (input.jadwal !== undefined) {
                await ctx.tx
                    .delete(jadwalTable)
                    .where(eq(jadwalTable.agendaId, agendaId));

                if (input.jadwal && input.jadwal.length) {
                    await ctx.tx.insert(jadwalTable).values(
                        input.jadwal.map((j) => ({
                            id: uuidv7(),
                            agendaId,
                            paketSoalId: j.paketSoalId,
                            startTime: j.startTime,
                            endTime: j.endTime,
                        })),
                    );
                }
            }
        });
    }

    public async delete(agendaId: string): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
                .delete(jadwalTable)
                .where(eq(jadwalTable.agendaId, agendaId));

            await ctx.tx
                .delete(agendaTable)
                .where(eq(agendaTable.id, agendaId));
        });
    }
}
