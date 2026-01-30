import { Module } from '@nestjs/common';
import { SubmitConsumer } from './jobs/submit.consumer';
import { WorkSessionController } from './api/work-session.controller';
import { RabbitMQModule } from '../../infra/rabbitmq/rabbitmq.module';
import { SessionManagerService } from './services/session-manager.service';
import { SubmitHandlerService } from './services/submit-handler.service';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';
import { SoalModule } from '../persoalan/soal/soal.module';
import { SessionStateQueryService } from './services/session-state-query.service';
import { WorkSessionQueryModule } from './work-session-query.module';
import { SubmitService } from './services/submit.service';
import { JadwalModule } from '../event/jadwal/jadwal.module';

@Module({
    imports: [RabbitMQModule, DrizzleModule, SoalModule, JadwalModule, WorkSessionQueryModule],
    controllers: [WorkSessionController],
    providers: [SubmitConsumer, SessionManagerService, SubmitHandlerService, SessionStateQueryService, SubmitService],
})
export class WorkSessionModule { }


