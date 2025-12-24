// uow.service.ts
import { Inject, Injectable } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { MySqlTransactionConfig } from "drizzle-orm/mysql-core";
import { UnitOfWork } from "./uow";
import { WRITE_DB } from "@/core/constants/db.constants";

@Injectable()
export class UnitOfWorkService {
    constructor(
        @Inject(WRITE_DB)
        private readonly db: MySql2Database,
    ) { }

    async run<T>(
        fn: (uow: UnitOfWork) => Promise<T>,
        config?: MySqlTransactionConfig,
    ): Promise<T> {
        return this.db.transaction(async (tx) => {
            return fn(new UnitOfWork(tx, config));
        }, config);
    }
}
