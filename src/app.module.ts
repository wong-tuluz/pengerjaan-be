import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/modules/drizzle/drizzle.module';
import { QuestionsModule } from '@/modules/questions/questions.module';
import { WorkSessionsModule } from '@/modules/work-sessions/work-sessions.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        DrizzleModule,
        QuestionsModule,
        WorkSessionsModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
})
export class AppModule {}
