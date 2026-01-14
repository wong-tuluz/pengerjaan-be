import { mysqlTable, varchar, datetime, text } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { int } from 'drizzle-orm/mysql-core';

export const agendaTable = mysqlTable('agenda', {
    id: varchar('id', { length: 36 }).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    startTime: datetime('start_time').notNull(),
    endTime: datetime('end_time').notNull(),
    description: text('description'),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
});

export const agendaSiswaTable = mysqlTable('agenda_siswa', {
    id: varchar('id', { length: 36 }).primaryKey(),
    agendaId: varchar('agenda_id', { length: 36 }).notNull(),
    siswaId: varchar('siswa_id', { length: 36 }).notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
});

export const jadwalTable = mysqlTable('jadwal', {
    id: varchar('id', { length: 36 }).primaryKey(),
    agendaId: varchar('agenda_id', { length: 36 }).notNull(),
    paketSoalId: varchar('paket_soal_id', { length: 36 }).notNull(),
    startTime: datetime('start_time').notNull(),
    endTime: datetime('end_time').notNull(),
    timeLimit: int().notNull(),
    attempts: int().notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
});
