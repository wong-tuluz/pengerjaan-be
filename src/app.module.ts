import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/modules/drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { QuestionModule } from './modules/questions/question.module';

@Module({
    imports: [
        DrizzleModule,
        QuestionModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
})
export class AppModule {}
