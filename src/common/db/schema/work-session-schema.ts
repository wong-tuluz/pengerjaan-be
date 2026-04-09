import { mysqlTable, varchar, datetime, boolean, mysqlEnum, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { int } from 'drizzle-orm/mysql-core';

export const workSessionTable = mysqlTable('work_sessions', {
    id: varchar('id', { length: 255 }).primaryKey(),
    siswaId: varchar('siswa_id', { length: 255 }).notNull(),
    jadwalId: varchar('jadwal_id', { length: 255 }).notNull(),

    paketSoalId: varchar('paket_soal_id', { length: 255 }).notNull(),
    materiSoalId: varchar('materi_soal_id', { length: 255 }),
    status: mysqlEnum('status', [
        'in_progress',
        'finished',
    ]).notNull(),

    strike: int('strike').notNull().default(0),

    timeLimit: int('time_limit').notNull(),
    startedAt: datetime('started_at').notNull(),
    finishedAt: datetime('finished_at'),

    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('siswa_idx').on(table.siswaId),
    index('jadwal_idx').on(table.jadwalId),
]);

export const workSessionAnswerTable = mysqlTable('work_session_answers', {
    id: varchar('id', { length: 255 }).primaryKey(),
    workSessionId: varchar('work_session_id', { length: 255 }).notNull(),
    soalId: varchar('soal_id', { length: 255 }).notNull(),
    jawabanSoalId: varchar('jawaban_soal_id', { length: 255 }),
    value: varchar('value', { length: 4096 }),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('work_session_idx').on(table.workSessionId),
    index('soal_idx').on(table.soalId),
]);

export const workSessionMarkerTable = mysqlTable('work_session_markers', {
    id: varchar('id', { length: 255 }).primaryKey(),
    workSessionId: varchar('work_session_id', { length: 255 }).notNull(),
    soalId: varchar('soal_id', { length: 255 }).notNull(),
    isMarked: boolean('is_marked').notNull().default(false),
}, (table) => [
    index('work_session_idx').on(table.workSessionId),
    index('soal_idx').on(table.soalId),
]);
