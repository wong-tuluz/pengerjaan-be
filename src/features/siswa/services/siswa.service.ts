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

    async findByUsername(username: string): Promise<Siswa | null> {
        const row = await this.rdb.select()
            .from(siswaTable)
            .where(eq(siswaTable.username, username))
            .then(rows => rows[0])

        if (!row) return null
        return new Siswa(row)
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

    async create(data: {
        nis: string;
        name: string;
        birthDate: Date;
        kelas: string;
        username: string;
        password: string;
    }): Promise<Siswa> {
        const existing = await this.findByUsername(data.username);

        if (existing) {
            return existing;
        }

        const siswa = new Siswa({
            id: crypto.randomUUID(),
            accountId: '',
            nama: data.name,
            nis: data.nis,
            kelas: data.kelas,
            username: data.username,
            password: data.password,
        });
        await this.upsert(siswa);

        this.createAccount(siswa.id);

        return siswa;
    }

    async createAccount(siswaId) {
        const siswa = await this.findById(siswaId)

        const res = await auth.api.signUpEmail({
            body: {
                name: siswa.nama,
                email: siswa.nama.replaceAll(' ', '').toLowerCase() + "@acme.com",
                password: siswa.password,
                username: siswa.username,
            }
        })

        siswa.setAccount(res.user.id)
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
