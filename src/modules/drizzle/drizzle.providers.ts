// drizzle.providers.ts
import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { READ_DB, WRITE_DB } from 'src/core/constants/db.constants';

export const drizzleProviders: Provider[] = [
  {
    provide: WRITE_DB,
    useFactory: () => {
      const pool = new Pool({
        connectionString: process.env.WRITE_DATABASE_URL!,
      });
      return drizzle(pool);
    },
  },
  {
    provide: READ_DB,
    useFactory: () => {
      const pool = new Pool({
        connectionString: process.env.READ_DATABASE_URL!,
      });
      return drizzle(pool);
    },
  },
];
