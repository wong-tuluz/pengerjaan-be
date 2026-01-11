import { Module } from '@nestjs/common';
import { AgendaQueryService } from './services/agenda-query.service';
import { AgendaService } from './services/agenda.service';
import { AgendaController } from './api/agenda.controller';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    providers: [AgendaQueryService, AgendaService],
    controllers: [AgendaController],
})
export class AgendaModule {}
