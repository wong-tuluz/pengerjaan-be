import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkSessionModule } from './features/work-session/work-session.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { DrizzleModule } from './infra/drizzle/drizzle.module';
import { AgendaModule } from './features/agenda/agenda.module';
import { SiswaModule } from './features/siswa/siswa.module';
import { SoalModule } from './features/soal/soal.module';
import { SeederController } from './infra/seeder/seeder.controller';
import { Seeder } from './infra/seeder/seeder';
import { AuthModule } from './features/auth/auth.module';

@Module({
    imports: [
        DrizzleModule,
        WorkSessionModule,
        AgendaModule,
        SiswaModule,
        SoalModule,
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    controllers: [
        SeederController
    ],
    providers: [
        Seeder,
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
