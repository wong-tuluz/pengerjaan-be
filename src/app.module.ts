import { BadRequestException, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WorkSessionModule } from './features/work-session/work-session.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { createZodValidationPipe, ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { DrizzleModule } from './infra/drizzle/drizzle.module';
import { AgendaModule } from './features/agenda/agenda.module';
import { SiswaModule } from './features/siswa/siswa.module';
import { SoalModule } from './features/soal/soal.module';
import { SeederController } from './infra/seeder/seeder.controller';
import { Seeder } from './infra/seeder/seeder';
import { AuthModule } from './features/auth/auth.module';
import { ZodError } from 'zod';


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
