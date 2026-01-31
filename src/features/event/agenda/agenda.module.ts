import { forwardRef, Module } from '@nestjs/common';
import { AgendaController } from './api/agenda.controller';
import { DrizzleModule } from '../../../infra/drizzle/drizzle.module';
import { SoalModule } from '../../persoalan/soal/soal.module';
import { AgendaService } from './service/agenda.service';
import { SiswaModule } from '../../siswa/siswa.module';
import { WorkSessionModule } from '../../session/work-session.module';

@Module({
    imports: [DrizzleModule, forwardRef(() => WorkSessionModule), SoalModule, SiswaModule],
    providers: [AgendaService],
    controllers: [AgendaController],
    exports: [AgendaService],
})
export class AgendaModule { }
