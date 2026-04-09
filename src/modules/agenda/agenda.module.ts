import { Module } from '@nestjs/common';
import { AgendaController } from './agenda.controller';
import { AgendaService } from './agenda.service';
import { SiswaModule } from '../siswa/siswa.module';

@Module({
    imports: [SiswaModule],
    controllers: [AgendaController],
    providers: [AgendaService],
    exports: [AgendaService],
})
export class AgendaModule { }