import { Body, Controller, Get, Inject, Injectable, Param, Post, Put } from "@nestjs/common";
import { WRITE_DB } from "../../common/config/db.constants";
import { MySql2Database } from "drizzle-orm/mysql2";
import { settingTable } from "../../infra/drizzle/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class SettingService {
    constructor(@Inject(WRITE_DB) private readonly db: MySql2Database) { }

    async store<T = any>(data: T, key: string = 'default') {
        await this.db.delete(settingTable).where(eq(settingTable.key, key))
        await this.db.insert(settingTable).values({ key, data: data })
    }

    async fetch<T = any>(key: string = 'default'): Promise<T | null> {
        const rows = await this.db
            .select()
            .from(settingTable)
            .where(eq(settingTable.key, key));

        if (!rows.length) {
            return null;
        }

        const raw = rows[0].data;

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw as string) as T;
        } catch (error) {
            throw new Error(`Invalid JSON stored for setting key: ${key}`);
        }
    }
}

@Controller('settings')
export class SettingController {
    constructor(private readonly service: SettingService) { }


    @Put()
    async store(@Body() data: any) {
        return await this.service.store(data)
    }

    @Put(':key')
    async storeKey(@Body() data: any, @Param('key') key: string) {
        return await this.service.store(data, key)
    }

    @Get()
    async fetch() {
        return this.service.fetch()
    }

    @Get(':key')
    async fetchKey(@Param('key') key: string) {
        return this.service.fetch(key)
    }


}