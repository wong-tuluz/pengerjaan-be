import { drizzle } from 'drizzle-orm/mysql2';
import { config } from 'dotenv';

config();

export const db = drizzle(process.env.DATABASE_URL ?? (() => { throw new Error('DATABASE_URL is not defined'); })());

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];