// drizzle.providers.ts
import { Provider } from '@nestjs/common';
import { drizzle } from "drizzle-orm/mysql2";
import { READ_DB, WRITE_DB } from '@/core/constants/db.constants';

export const drizzleProviders: Provider[] = [
  {
    provide: WRITE_DB,
    useFactory: () => {
      return drizzle(process.env.WRITE_DATABASE_URL!, { logger: true });
    },
  },
  {
    provide: READ_DB,
    useFactory: () => {
      const db = drizzle(process.env.READ_DATABASE_URL!, { logger: true });
      return db;
    },
  },
];
