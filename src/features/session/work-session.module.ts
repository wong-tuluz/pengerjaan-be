import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../../infra/rabbitmq/rabbitmq.module';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';
import { SoalModule } from '../persoalan/soal.module';
import { SessionStateService } from './session-state/services/session-state.service';
import { JadwalModule } from '../event/jadwal/jadwal.module';
import { SessionController } from './session/api/session.controller';
import { SessionStateController } from './session-state/api/session-state.controller';
import { SessionService } from './session/services/session.service';
import { SiswaModule } from '../siswa/siswa.module';
import { SubmitService } from './session-state/services/submit.service';

@Module({
    imports: [RabbitMQModule, DrizzleModule, SoalModule, JadwalModule, SiswaModule],
    controllers: [SessionController, SessionStateController],
    providers: [SessionService, SessionStateService, SubmitService],
})
export class WorkSessionModule { }


