import { json } from "drizzle-orm/mysql-core";
import { mysqlTable } from "drizzle-orm/mysql-core";

export const settingTable = mysqlTable('settings', {
    data: json('data')
})