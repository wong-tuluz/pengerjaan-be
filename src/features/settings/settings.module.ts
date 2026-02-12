import { Module } from "@nestjs/common";
import { SettingController, SettingService } from "./settings.controller";
import { DrizzleModule } from "../../infra/drizzle/drizzle.module";

@Module({
    imports: [DrizzleModule],
    controllers: [SettingController],
    providers: [SettingService],
    exports: [SettingService]
})
export class SettingsModule { }