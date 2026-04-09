import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const siswaTable = mysqlTable('siswa', {
    id: varchar('id', { length: 255 }).primaryKey(),
    accountId: varchar('account_id', { length: 255 }),
    nama: varchar('nama', { length: 255 }).notNull(),
    nis: varchar('nis', { length: 50 }).notNull(),
    kelas: varchar('kelas', { length: 50 }).notNull(),
    username: varchar('username', { length: 100 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
});
