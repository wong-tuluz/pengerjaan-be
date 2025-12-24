import { Module } from "@nestjs/common";
import { QuestionQueryController } from "./api/question-query.contorller";
import { QuestionCommandController } from "./api/question-command.controller";
import { QuestionService } from "./application/question.service";
import { QuestionRepository } from "./repository/question.repository";
import { QuestionGroupRepository } from "./repository/question-group.repository";
import { questionAnswerRelations } from "../drizzle/schema";
import { QuestionAnswerRepository } from "./repository/question-answer.repository";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { UnitOfWorkService } from "@/core/uow/uow.service";

@Module({
    imports: [DrizzleModule],
    controllers: [QuestionQueryController, QuestionCommandController],
    providers: [QuestionService, QuestionRepository, QuestionGroupRepository, QuestionAnswerRepository, UnitOfWorkService]
})
export class QuestionModule { }