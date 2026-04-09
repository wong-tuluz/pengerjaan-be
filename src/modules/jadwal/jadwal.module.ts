import { Module } from '@nestjs/common';
import { JadwalController } from './jadwal.controller';
import { JadwalService } from './jadwal.service';
import { SiswaModule } from '../siswa/siswa.module';
import { AgendaModule } from '../agenda/agenda.module';
import { PaketSoalModule } from '../paket-soal/paket-soal.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [SiswaModule, AgendaModule, PaketSoalModule, SettingsModule],
    controllers: [JadwalController],
    providers: [JadwalService],
    exports: [JadwalService],
})
export class JadwalModule { }