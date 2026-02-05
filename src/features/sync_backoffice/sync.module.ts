import { HttpModule } from "@nestjs/axios";
import { BackofficeService } from "./services/backoffice.service";
import { EventSyncHandler } from "./services/handlers/event.sync";
import { Module } from "@nestjs/common";
import { AgendaModule } from "../event/agenda/agenda.module";
import { JadwalModule } from "../event/jadwal/jadwal.module";
import { SoalModule } from "../persoalan/soal.module";
import { SyncController } from "./api/sync.controller";
import { SiswaModule } from "../siswa/siswa.module";

@Module({
    imports: [HttpModule, AgendaModule, JadwalModule, SoalModule, SiswaModule],
    providers: [BackofficeService, EventSyncHandler],
    exports: [BackofficeService, EventSyncHandler],
    controllers: [SyncController],
})
export class SyncModule { }