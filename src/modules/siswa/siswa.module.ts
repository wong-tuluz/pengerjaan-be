import { Module } from "@nestjs/common";
import { SiswaService } from "./siswa.service";
import { SiswaController, ProfileController } from "./siswa.controller";

@Module({
    controllers: [SiswaController, ProfileController],
    providers: [SiswaService],
    exports: [SiswaService],
})
export class SiswaModule { }