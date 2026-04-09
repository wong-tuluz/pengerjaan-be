import {
    mysqlTable,
    varchar,
    datetime,
    text,
    int,
    boolean,
    mysqlEnum,
    index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { longtext } from 'drizzle-orm/mysql-core';

/* =======================
   Paket Soal
   ======================= */
export const paketSoalTable = mysqlTable('paket_soal', {
    id: varchar('id', { length: 255 }).primaryKey(),
    remoteId: varchar('remote_id', { length: 255 }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('remote_idx').on(table.remoteId),
]);

/* =======================
   Materi Soal
   ======================= */
export const materiSoalTable = mysqlTable('materi_soal', {
    id: varchar('id', { length: 255 }).primaryKey(),
    remoteId: varchar('remote_id', { length: 255 }),
    paketSoalId: varchar('paket_soal_id', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    order: int('order').notNull(),
    timeLimit: int('time_limit').notNull(), // minutes
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('paket_soal_idx').on(table.paketSoalId),
    index('remote_idx').on(table.remoteId),
]);

/* =======================
   Soal
   ======================= */
export const soalTable = mysqlTable('soal', {
    id: varchar('id', { length: 255 }).primaryKey(),
    remoteId: varchar('remote_id', { length: 255 }),
    materiSoalId: varchar('materi_soal_id', { length: 255 }).notNull(),
    type: mysqlEnum('type', [
        'single-choice',
        'multiple-choice',
        'essay',
    ]).notNull(),
    prompt: longtext('prompt').notNull(),
    order: int('order').notNull(),
    weightCorrect: int('weight_correct').notNull(),
    weightWrong: int('weight_wrong').notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('materi_soal_idx').on(table.materiSoalId),
    index('remote_idx').on(table.remoteId),
]);

/* =======================
   Jawaban Soal
   ======================= */
export const jawabanSoalTable = mysqlTable('jawaban_soal', {
    id: varchar('id', { length: 255 }).primaryKey(),
    soalId: varchar('soal_id', { length: 255 }).notNull(),
    value: longtext('value').notNull(),
    isCorrect: boolean('is_correct').notNull(),
    order: int('order').notNull(),
    createdAt: datetime('created_at')
        .notNull()
        .default(sql`now()`),
    updatedAt: datetime('updated_at').$onUpdate(() => new Date()),
}, (table) => [
    index('soal_idx').on(table.soalId),
]);
