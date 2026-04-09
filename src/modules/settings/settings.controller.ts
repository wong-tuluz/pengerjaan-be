import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { SettingService } from "./settings.service";

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