import { mysqlTable, varchar, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const siswaTable = mysqlTable('siswa', {
    id: varchar('id', { length: 36 }).primaryKey(),
    nama: varchar('nama', { length: 255 }).notNull(),
    nis: varchar('nis', { length: 50 }).notNull(),
    kelas: varchar('kelas', { length: 50 }).notNull(),
    username: varchar('username', { length: 100 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
});
