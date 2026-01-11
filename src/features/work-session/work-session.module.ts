import { Module } from '@nestjs/common';
import { SubmitConsumer } from './jobs/submit.consumer';
import { WorkSessionController } from './api/work-session.controller';
import { RabbitMQModule } from '../../infra/rabbitmq/rabbitmq.module';
import { SessionManagerService } from './services/session-manager.service';
import { SubmitHandlerService } from './services/submit-handler.service';

@Module({
    imports: [RabbitMQModule],
    controllers: [WorkSessionController],
    providers: [SubmitConsumer, SessionManagerService, SubmitHandlerService],
})
export class WorkSessionModule {}
