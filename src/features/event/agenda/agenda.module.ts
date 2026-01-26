import { Module } from '@nestjs/common';
import { AgendaQueryService } from './agenda-query.service';
import { AgendaService } from './agenda-command.service';
import { AgendaController } from './agenda.controller';
import { DrizzleModule } from '../../../infra/drizzle/drizzle.module';
import { JadwalController } from '../jadwal/jadwal.controller';
import { JadwalQueryService } from '../jadwal/jadwal-query.service';
import { WorkSessionQueryModule } from '../../session/work-session-query.module';
import { SoalModule } from '../../persoalan/soal/soal.module';

@Module({
    imports: [DrizzleModule, WorkSessionQueryModule, SoalModule],
    providers: [AgendaQueryService, AgendaService, JadwalQueryService],
    controllers: [AgendaController, JadwalController],
    exports: [AgendaQueryService, JadwalQueryService],
})
export class AgendaModule { }
