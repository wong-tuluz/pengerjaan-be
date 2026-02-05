import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../../infra/drizzle/drizzle.module';
import { JadwalController } from './api/jadwal.controller';
import { JadwalService } from './services/jadwal.service';
import { SiswaModule } from '../../siswa/siswa.module';
import { AgendaModule } from '../agenda/agenda.module';
import { SoalModule } from '../../persoalan/soal.module';

@Module({
    imports: [DrizzleModule, SiswaModule, AgendaModule, SoalModule],
    providers: [JadwalService],
    controllers: [JadwalController],
    exports: [JadwalService],
})
export class JadwalModule { }
