import { Command, CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IQuestion, TimeType } from '@/modules/questions/models/question';
import { QuestionsWriteRepository } from '../../repositories/question-write.repository';
import { basePath } from '../../questions.constants';
import { Body, Controller, Post } from '@nestjs/common';

interface AddQuestionResult {}

export class AddQuestion extends Command<AddQuestionResult> {
    constructor(
        public readonly groupId: string,
        public readonly question: IQuestion,
    ) {
        super();
    }
}

@CommandHandler(AddQuestion)
export class AddQuestionHandler implements ICommandHandler<AddQuestion> {
    constructor(private readonly repo: QuestionsWriteRepository) {}

    async execute(
        command: AddQuestion,
    ): Promise<AddQuestionResult> {
        await this.repo.upsertQuestion(command.groupId, command.question);

        return {};
    }
}