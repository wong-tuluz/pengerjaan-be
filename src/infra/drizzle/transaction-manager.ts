// uow.service.ts
import { Inject, Injectable } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { MySqlTransactionConfig } from "drizzle-orm/mysql-core";
import { TransactionContext } from "./transaction-context";
import { WRITE_DB } from "../../config/db.constants";

@Injectable()
export class TransactionManager {
    constructor(
        @Inject(WRITE_DB)
        private readonly db: MySql2Database,
    ) { }

    async run<T>(
        fn: (uow: TransactionContext) => Promise<T>,
        config?: MySqlTransactionConfig,
    ): Promise<T> {
        return this.db.transaction(async (tx) => {
            return fn(new TransactionContext(tx, config));
        }, config);
    }
}
