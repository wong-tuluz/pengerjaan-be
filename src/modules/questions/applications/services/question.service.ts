import { Injectable } from "@nestjs/common";
import { createQuestionGroup, QuestionGroup } from "../../models/question";
import { QuestionsWriteRepository } from "../../repositories/question-write.repository";
import { QuestionsReadRepository } from "../../repositories/question-read.repository";
import { CreateQuestionDto } from "../../dtos/question-create.dto";
import { createComplexChoice } from "../../models/complex-choice";
import { createEssay } from "../../models/essay";
import { createMultipleChoice } from "../../models/multiple-choice";
import { createQuestionAnswer } from "../../models/question-answer";
import { ModifyQuestionDto } from "../../dtos/question-modify.dto";

@Injectable()
export class QuestionService {
    constructor(
        private readonly writeRepo: QuestionsWriteRepository,
        private readonly readRepo: QuestionsReadRepository
    ) { }

    async add(groupId: string, data: CreateQuestionDto) {
        switch (data.type) {
            case 'multiple-choice': {
                const answers = data.choices.map(c => createQuestionAnswer(c.answer, c.isCorrect));
                const question = createMultipleChoice(data.number, data.question, answers)

                await this.writeRepo.upsertQuestion(groupId, question);
                await this.writeRepo.upsertQuestionAnswers(question.id, answers);
                break;
            }

            case 'complex-choice': {
                const answers = data.choices.map(c => createQuestionAnswer(c.answer, c.isCorrect));
                const question = createComplexChoice(data.number, data.question, answers)

                await this.writeRepo.upsertQuestion(groupId, question);
                await this.writeRepo.upsertQuestionAnswers(question.id, answers);
                break;
            }

            case 'essay': {
                const answer = createQuestionAnswer(data.answer.answer, true);
                const question = createEssay(data.number, data.question, answer)

                await this.writeRepo.upsertQuestion(groupId, question);
                await this.writeRepo.upsertQuestionAnswers(question.id, [answer]);
            }
        }

    }

    async modify(groupId: string, data: ModifyQuestionDto) {
        switch (data.type) {
            case 'multiple-choice': {
                const answers = data.choices.map(c => createQuestionAnswer(c.answer, c.isCorrect));
                const question = createMultipleChoice(data.number, data.question, answers)

                await this.writeRepo.upsertQuestion(groupId, question);
                await this.writeRepo.upsertQuestionAnswers(question.id, answers);
                break;
            }

            case 'complex-choice': {
                const answers = data.choices.map(c => createQuestionAnswer(c.answer, c.isCorrect));
                const question = createComplexChoice(data.number, data.question, answers)

                await this.writeRepo.upsertQuestion(groupId, question);
                await this.writeRepo.upsertQuestionAnswers(question.id, answers);
                break;
            }

            case 'essay': {
                const answer = createQuestionAnswer(data.answer.answer, true);
                const question = createEssay(data.number, data.question, answer)

                await this.writeRepo.upsertQuestion(groupId, question);
                await this.writeRepo.upsertQuestionAnswers(question.id, [answer]);
            }
        }
    }
}