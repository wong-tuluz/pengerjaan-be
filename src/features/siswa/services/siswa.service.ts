import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { READ_DB, WRITE_DB } from '../../../common/config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { agendaSiswaTable, siswaTable } from '../../../infra/drizzle/schema';
import { and, eq, exists } from 'drizzle-orm';
import { Siswa } from '../domains/siswa';
import { auth } from '../../auth/auth';

@Injectable()
export class SiswaService {
    constructor(
        @Inject(READ_DB) private readonly rdb: MySql2Database,
        @Inject(WRITE_DB) private readonly db: MySql2Database
    ) { }

    async listAll(filter?: { kelas?: string, agendaId?: string }) {
        const rows = await this.rdb.select()
            .from(siswaTable)
            .where(and(...[
                filter?.kelas ? eq(siswaTable.kelas, filter.kelas) : undefined,
                filter?.agendaId ? exists(
                    this.rdb.select().from(agendaSiswaTable)
                        .where(and(
                            eq(agendaSiswaTable.siswaId, siswaTable.id),
                            eq(agendaSiswaTable.agendaId, filter.agendaId),
                        )),
                ) : undefined
            ]));

        return rows
    }

    async findById(siswaId: string): Promise<Siswa> {
        const row = await this.rdb.select()
            .from(siswaTable)
            .where(eq(siswaTable.id, siswaId))
            .then(rows => rows[0])

        if (!row) throw new NotFoundException()
        return new Siswa(row)
    }

    async findByAccount(accountId: string): Promise<Siswa> {
        const row = await this.rdb.select()
            .from(siswaTable)
            .where(eq(siswaTable.accountId, accountId))
            .then(rows => rows[0])

        if (!row) throw new NotFoundException()
        return new Siswa(row)
    }

    async setPassword(siswaId: string, password: string) {
        const siswa = await this.findById(siswaId)
        siswa.setPassword(password)

        const ctx = await (auth.$context)
        ctx.internalAdapter.updatePassword(siswa.accountId, password)

        await this.upsert(siswa)
    }

    async createAccount(siswaId) {
        const siswa = await this.findById(siswaId)

        const ctx = await (auth.$context)
        const res = await ctx.internalAdapter.createUser({
            name: siswa.nama,
            email: siswa.nama.replaceAll(' ', '').toLowerCase() + "@acme.com",
            password: siswa.password,
            username: siswa.nama.split(' ')[0],
        })

        siswa.setAccount(res.id)
        await this.upsert(siswa)
    }

    private async upsert(siswa: Siswa) {
        await this.db
            .insert(siswaTable)
            .values(siswa)
            .onDuplicateKeyUpdate({
                set: {
                    accountId: siswa.accountId,
                    password: siswa.password,
                    updatedAt: new Date()
                }
            });
    }
}
