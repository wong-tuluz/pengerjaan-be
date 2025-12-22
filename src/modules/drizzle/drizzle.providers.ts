// drizzle.providers.ts
import { Provider } from '@nestjs/common';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { READ_DB, WRITE_DB } from '@/core/constants/db.constants';

export const drizzleProviders: Provider[] = [
    {
        provide: WRITE_DB,
        useFactory: () => {
            const sql = neon(process.env.WRITE_DATABASE_URL!);
            return drizzle({
                client: sql,
                logger: true,
            });
        },
    },
    {
        provide: READ_DB,
        useFactory: () => {
            const sql = neon(process.env.READ_DATABASE_URL!);
            const db = drizzle({
                client: sql,
                logger: true,
            });
            return db;
        },
    },
];
