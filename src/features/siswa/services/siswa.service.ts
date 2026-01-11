import { Injectable } from '@nestjs/common';
import { TransactionManager } from '../../../infra/drizzle/transaction-manager';
import { v7 as uuidv7 } from 'uuid';
import { siswaTable } from '../../../infra/drizzle/schema';
import { eq } from 'drizzle-orm/sql';

@Injectable()
export class SiswaService {
    constructor(private readonly txm: TransactionManager) {}

    public async create(input: {
        nama: string;
        nis: string;
        kelas: string;
        username: string;
        passwordHash: string;
    }): Promise<{ id: string }> {
        const id = uuidv7();

        await this.txm.run(async (ctx) => {
            await ctx.tx.insert(siswaTable).values({
                id,
                nama: input.nama,
                nis: input.nis,
                kelas: input.kelas,
                username: input.username,
                passwordHash: input.passwordHash,
            });
        });

        return { id };
    }

    public async update(
        siswaId: string,
        input: {
            nama?: string;
            nis?: string;
            kelas?: string;
            username?: string;
            passwordHash?: string;
        },
    ): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx
                .update(siswaTable)
                .set({
                    ...(input.nama && { nama: input.nama }),
                    ...(input.nis && { nis: input.nis }),
                    ...(input.kelas && { kelas: input.kelas }),
                    ...(input.username && { username: input.username }),
                    ...(input.passwordHash && {
                        passwordHash: input.passwordHash,
                    }),
                })
                .where(eq(siswaTable.id, siswaId));
        });
    }

    public async delete(siswaId: string): Promise<void> {
        await this.txm.run(async (ctx) => {
            await ctx.tx.delete(siswaTable).where(eq(siswaTable.id, siswaId));
        });
    }
}
