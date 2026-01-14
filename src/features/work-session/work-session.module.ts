import { Module } from '@nestjs/common';
import { SubmitConsumer } from './jobs/submit.consumer';
import { WorkSessionController } from './api/work-session.controller';
import { RabbitMQModule } from '../../infra/rabbitmq/rabbitmq.module';
import { SessionManagerService } from './services/session-manager.service';
import { SubmitHandlerService } from './services/submit-handler.service';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';
import { SoalModule } from '../soal/soal.module';
import { AgendaModule } from '../agenda/agenda.module';
import { SessionStateQueryService } from './services/session-state-query.service';
import { WorkSessionQueryModule } from './work-session-query.module';

@Module({
    imports: [RabbitMQModule, DrizzleModule, SoalModule, AgendaModule, WorkSessionQueryModule],
    controllers: [WorkSessionController],
    providers: [SubmitConsumer, SessionManagerService, SubmitHandlerService, SessionStateQueryService],

})
export class WorkSessionModule { }


