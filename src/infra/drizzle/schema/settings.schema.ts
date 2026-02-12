import { varchar } from "drizzle-orm/mysql-core";
import { json } from "drizzle-orm/mysql-core";
import { mysqlTable } from "drizzle-orm/mysql-core";

export const settingTable = mysqlTable('settings', {
    key: varchar('key', { length: 255 }).primaryKey(),
    data: json('data')
})