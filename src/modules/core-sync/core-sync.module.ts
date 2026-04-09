import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoreSyncController } from './core-sync.controller';
import { CoreSyncService } from './core-sync.service';
import { SettingsModule } from '../settings/settings.module';
import { AgendaModule } from '../agenda/agenda.module';
import { JadwalModule } from '../jadwal/jadwal.module';
import { PaketSoalModule } from '../paket-soal/paket-soal.module';
import { MateriModule } from '../materi/materi.module';
import { SoalModule } from '../soal/soal.module';
import { SiswaModule } from '../siswa/siswa.module';

@Module({
    imports: [
        HttpModule,
        SettingsModule,
        AgendaModule,
        JadwalModule,
        PaketSoalModule,
        MateriModule,
        SoalModule,
        SiswaModule
    ],
    controllers: [CoreSyncController],
    providers: [CoreSyncService],
})
export class CoreSyncModule { }