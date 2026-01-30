import { Module } from '@nestjs/common';
import { AgendaController } from './api/agenda.controller';
import { DrizzleModule } from '../../../infra/drizzle/drizzle.module';
import { WorkSessionQueryModule } from '../../session/work-session-query.module';
import { SoalModule } from '../../persoalan/soal/soal.module';
import { AgendaService } from './service/agenda.service';
import { SiswaModule } from '../../siswa/siswa.module';

@Module({
    imports: [DrizzleModule, WorkSessionQueryModule, SoalModule, SiswaModule],
    providers: [AgendaService],
    controllers: [AgendaController],
    exports: [AgendaService],
})
export class AgendaModule { }
