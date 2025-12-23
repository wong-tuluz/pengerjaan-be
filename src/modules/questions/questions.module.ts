import { Module } from '@nestjs/common';
import { QuestionsWriteRepository } from './repositories/question-write.repository';
import { QuestionsReadRepository } from './repositories/question-read.repository';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionGroupsController } from './api/question-group.controller';
import { QuestionGroupService } from './applications/services/question-group.service';

@Module({
    imports: [DrizzleModule, CqrsModule],
    providers: [
        QuestionGroupService,
        QuestionsWriteRepository,
        QuestionsReadRepository
    ],
    controllers: [QuestionGroupsController],
})
export class QuestionsModule { }
