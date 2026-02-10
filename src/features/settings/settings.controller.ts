import { Body, Controller, Get, Inject, Post, Put } from "@nestjs/common";
import { WRITE_DB } from "../../common/config/db.constants";
import { MySql2Database } from "drizzle-orm/mysql2";
import { settingTable } from "../../infra/drizzle/schema";

@Controller('settings')
export class SettingController {
    constructor(@Inject(WRITE_DB) private readonly db: MySql2Database) { }

    @Put()
    async store(@Body() data: any) {
        await this.db.delete(settingTable)
        await this.db.insert(settingTable).values({data})
    }

    @Get()
    async fetch() {
        return await this.db.select().from(settingTable).then(rows => rows[0].data)
    }
}