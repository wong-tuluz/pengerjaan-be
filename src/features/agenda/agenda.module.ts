import { Module } from '@nestjs/common';
import { AgendaQueryService } from './services/agenda-query.service';
import { AgendaService } from './services/agenda.service';
import { AgendaController } from './api/agenda.controller';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';
import { JadwalController } from './api/jadwal.controller';
import { JadwalQueryService } from './services/jadwal-query.service';
import { WorkSessionQueryModule } from '../work-session/work-session-query.module';
import { SoalModule } from '../soal/soal.module';

@Module({
    imports: [DrizzleModule, WorkSessionQueryModule, SoalModule],
    providers: [AgendaQueryService, AgendaService, JadwalQueryService],
    controllers: [AgendaController, JadwalController],
    exports: [AgendaQueryService, JadwalQueryService],
})
export class AgendaModule { }
