import { Inject, Injectable } from '@nestjs/common';
import { READ_DB } from '../../../config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { siswaTable } from '../../../infra/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class SiswaQueryService {
    constructor(@Inject(READ_DB) private readonly db: MySql2Database) { }

    async getAll(): Promise<
        {
            id: string;
            nama: string;
            nis: string;
            kelas: string;
            username: string;
            passwordHash: string;
            createdAt: Date;
            updatedAt: Date | null;
        }[]
    > {
        return await this.db.select().from(siswaTable);
    }

    async getById(siswaId: string): Promise<{
        id: string;
        nama: string;
        nis: string;
        kelas: string;
        username: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date | null;
    } | null> {
        const siswa = await this.db
            .select()
            .from(siswaTable)
            .where(eq(siswaTable.id, siswaId))
            .limit(1)
            .then((rows) => rows[0]);

        return siswa || null;
    }

    async getByUsername(username: string): Promise<{
        id: string;
        nama: string;
        nis: string;
        kelas: string;
        username: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date | null;
    } | null> {
        const siswa = await this.db
            .select()
            .from(siswaTable)
            .where(eq(siswaTable.username, username))
            .limit(1)
            .then((rows) => rows[0]);

        return siswa || null;
    }
}
