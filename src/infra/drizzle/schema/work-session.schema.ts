import { mysqlTable, varchar, datetime, boolean } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { int } from 'drizzle-orm/mysql-core';

export const workSessionTable = mysqlTable('work_sessions', {
    id: varchar('id', { length: 36 }).primaryKey(),
    siswaId: varchar('siswa_id', { length: 36 }).notNull(),
    jadwalId: varchar('jadwal_id', { length: 36 }).notNull(),

    paketSoalId: varchar('paket_soal_id', { length: 36 }).notNull(),
    materiSoalId: varchar('materi_soal_id', { length: 36 }),

    timeLimit: int('time_limit').notNull(),
    startedAt: datetime('started_at').notNull(),
    finishedAt: datetime('finished_at'),

    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
});

export const workSessionAnswerTable = mysqlTable('work_session_answers', {
    id: varchar('id', { length: 36 }).primaryKey(),
    workSessionId: varchar('work_session_id', { length: 36 }).notNull(),
    soalId: varchar('soal_id', { length: 36 }).notNull(),
    jawabanSoalId: varchar('jawaban_soal_id', { length: 36 }),
    value: varchar('value', { length: 4096 }),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
});

export const workSessionMarkerTable = mysqlTable('work_session_markers', {
    id: varchar('id', { length: 36 }).primaryKey(),
    workSessionId: varchar('work_session_id', { length: 36 }).notNull(),
    soalId: varchar('soal_id', { length: 36 }).notNull(),
    isMarked: boolean('is_marked').notNull().default(false),
});
