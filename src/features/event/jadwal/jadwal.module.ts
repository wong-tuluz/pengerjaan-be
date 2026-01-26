import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../../infra/drizzle/drizzle.module';
import { JadwalController } from './jadwal.controller';
import { WorkSessionQueryModule } from '../../session/work-session-query.module';
import { SoalModule } from '../../persoalan/soal/soal.module';
import { JadwalQueryService } from './jadwal-query.service';

@Module({
    imports: [DrizzleModule, WorkSessionQueryModule, SoalModule],
    providers: [JadwalQueryService],
    controllers: [JadwalController],
    exports: [JadwalQueryService],
})
export class AgendaModule {}
