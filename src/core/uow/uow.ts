// uow.ts
import { ExtractTablesWithRelations } from "drizzle-orm";
import { MySqlTransaction, MySqlTransactionConfig } from "drizzle-orm/mysql-core";
import { MySql2QueryResultHKT, MySql2PreparedQueryHKT } from "drizzle-orm/mysql2";

export class UnitOfWork {
  constructor(
    public readonly tx: MySqlTransaction<
      MySql2QueryResultHKT,
      MySql2PreparedQueryHKT,
      Record<string, never>,
      ExtractTablesWithRelations<Record<string, never>>
    >,
    public readonly config?: MySqlTransactionConfig
  ) { }
}
