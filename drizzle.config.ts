import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
    schema: './src/modules/drizzle/schema',
    out: './migration',
    dialect: 'mysql',
    dbCredentials: {
        url: process.env.WRITE_DATABASE_URL!,
    },
} satisfies Config;
