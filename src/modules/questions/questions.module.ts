import { Module } from '@nestjs/common';
import { QuestionsWriteRepository } from './repositories/question-write.repository';
import { QuestionsReadRepository } from './repositories/question-read.repository';
import { DrizzleModule } from '../drizzle/drizzle.module';
import {
    GetAllQuestionGroupEndpoint,
    GetAllQuestionGroupHandler,
} from './applications/queries/all-questions';
import {
    GetQuestionGroupEndpoint,
    GetQuestionGroupHandler,
} from './applications/queries/by-id-questions';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
    imports: [DrizzleModule, CqrsModule],
    providers: [
        QuestionsWriteRepository,
        QuestionsReadRepository,
        GetAllQuestionGroupHandler,
        GetQuestionGroupHandler,
    ],
    controllers: [GetAllQuestionGroupEndpoint, GetQuestionGroupEndpoint],
})
export class QuestionsModule {}
