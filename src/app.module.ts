import { BadRequestException, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkSessionModule } from './features/session/work-session.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { createZodValidationPipe, ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { DrizzleModule } from './infra/drizzle/drizzle.module';
import { AgendaModule } from './features/event/agenda/agenda.module';
import { SiswaModule } from './features/siswa/siswa.module';
import { SoalModule } from './features/persoalan/soal.module';
import { SeederController } from './features/seeder/seeder.controller';
import { Seeder } from './features/seeder/seeder';
import { AuthModule } from './features/auth/auth.module';
import { ZodError } from 'zod';
import { JadwalModule } from './features/event/jadwal/jadwal.module';
import { SyncModule } from './features/sync_backoffice/sync.module';
import { SettingController } from './features/settings/settings.controller';
import { SettingsModule } from './features/settings/settings.module';


const MyZodValidationPipe = createZodValidationPipe({
    // provide custom validation exception factory
    createValidationException: (error: ZodError) =>
        new BadRequestException('Ooops'),
})


@Module({
    imports: [
        DrizzleModule,
        WorkSessionModule,
        AgendaModule,
        JadwalModule,
        SiswaModule,
        SoalModule,
        AuthModule,
        SyncModule,
        SettingsModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    controllers: [
        SeederController,
    ],
    providers: [
        Seeder,
        {
            provide: APP_PIPE,
            // useClass: MyZodValidationPipe,
            useClass: ZodValidationPipe
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ZodSerializerInterceptor,
        },
    ],
})
export class AppModule { }
