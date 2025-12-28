import { UnitOfWorkService } from '@/core/uow/uow.service';
import {
    Question,
    QuestionGroup,
    QuestionType,
} from '../domain/question.entity';
import { QuestionGroupRepository } from '../repository/question-group.repository';
import { QuestionRepository } from '../repository/question.repository';
import { QuestionAnswerRepository } from '../repository/question-answer.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionService {
    constructor(
        private readonly uow: UnitOfWorkService,
        private readonly groupRepo: QuestionGroupRepository,
        private readonly questionRepo: QuestionRepository,
        private readonly answerRepo: QuestionAnswerRepository,
    ) {}

    async createGroup(name: string, description: string) {
        const group = QuestionGroup.create(name, description);

        console.log(this.groupRepo);
        this.groupRepo.upsert(group);
    }

    async removeGroup(id: string) {
        const group = await this.groupRepo.findById(id);
        if (!group) return;

        const questions = await this.questionRepo.find(group?.id);

        await this.uow.run(async (uow) => {
            for (const q of questions) {
                await this.answerRepo.upsert(uow, q.id, []);
                await this.questionRepo.delete(uow, q.id);
            }

            this.groupRepo.delete(uow, group.id);
        });
    }

    async addQuestion(
        groupId: string,
        type: QuestionType,
        prompt: string,
        answers: { value: string; isCorrect: boolean }[],
    ) {
        const group = await this.groupRepo.findById(groupId);

        if (!group) {
            throw new Error(`Group with id ${groupId} not found`);
        }

        const question = Question.create(type, group.id, prompt);

        for (const a of answers) {
            await question.addAnswer(a.value, a.isCorrect);
        }

        question.assert();

        await this.uow.run(async (uow) => {
            await this.questionRepo.upsert(uow, question);
            console.log('question in');

            await this.answerRepo.upsert(uow, question.id, question.answers);
            console.log('answer in');
        });

        console.log('tx complete');
    }

    async modifyQuestion(
        questionId: string,
        type?: QuestionType | null,
        prompt?: string | null,
        answers?: { value: string; isCorrect: boolean }[] | null,
    ) {
        const question = await this.questionRepo.findById(questionId);
        if (!question) throw new Error('Not found');

        question.type = type ?? question.type;
        question.prompt = prompt ?? question.prompt;

        if (answers) {
            question.clearAnswers()
            
            for (const a of answers) {
                await question.addAnswer(a.value, a.isCorrect);
            }
        }

        question.assert();

        await this.uow.run(async (uow) => {
            await this.questionRepo.upsert(uow, question);
            await this.answerRepo.upsert(uow, question.id, question.answers);
        });
    }

    async removeQuestion(questionId: string) {
        await this.uow.run(async (uow) => {
            await this.answerRepo.upsert(uow, questionId, []);
            await this.questionRepo.delete(uow, questionId);
        });
    }
}
