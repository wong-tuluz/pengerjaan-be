import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { MateriModule } from './modules/materi/materi.module';
import { SoalModule } from './modules/soal/soal.module';
import { PaketSoalModule } from './modules/paket-soal/paket-soal.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { JadwalModule } from './modules/jadwal/jadwal.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PengerjaanModule } from './modules/pengerjaan/pengerjaan.module';
import { PengerjaanStateModule } from './modules/pengerjaan-state/pengerjaan-state.module';
import { PengerjaanDetailModule } from './modules/pengerjaan-detail/pengerjaan-detail.module';
import { CoreSyncModule } from './modules/core-sync/core-sync.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    MateriModule,
    SoalModule,
    PaketSoalModule,
    AgendaModule,
    JadwalModule,
    SettingsModule,
    PengerjaanModule,
    PengerjaanStateModule,
    PengerjaanDetailModule,
    CoreSyncModule,
    RedisModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule { }
