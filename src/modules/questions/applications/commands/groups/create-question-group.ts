import {
    Command,
    CommandBus,
    CommandHandler,
    ICommandHandler,
} from '@nestjs/cqrs';
import { QuestionsWriteRepository } from '../../../repositories/question-write.repository';
import { createQuestionGroup, QuestionGroup } from '../../../models/question';
import { Body, Controller, Post } from '@nestjs/common';
import { basePath } from '../../../questions.constants';

interface CreateQuestionGroupResult {}

export class CreateQuestionGroup extends Command<CreateQuestionGroupResult> {
    constructor(
        public readonly timeLimit: number,
        public readonly randomizeAnswer: boolean,
        public readonly randomizeQuestion: boolean,
    ) {
        super();
    }
}

@CommandHandler(CreateQuestionGroup)
export class CreateQuestionGroupHandler implements ICommandHandler<CreateQuestionGroup> {
    constructor(private readonly repo: QuestionsWriteRepository) {}

    async execute(
        command: CreateQuestionGroup,
    ): Promise<CreateQuestionGroupResult> {
        const group = createQuestionGroup(
            command.timeLimit,
            command.randomizeAnswer,
            command.randomizeQuestion,
        );

        await this.repo.upsertGroup(group.id, group.timeLimit);

        return {};
    }
}

@Controller(basePath.questionGroups)
export class CreateQuestionGroupEndpoint {
    constructor(private readonly commandBus: CommandBus) {}

    @Post()
    async create(
        @Body()
        body: {
            id: string;
            timeLimit: number;
            randomizeAnswer: boolean;
            randomizeQuestion: boolean;
        },
    ): Promise<CreateQuestionGroupResult> {
        return this.commandBus.execute(
            new CreateQuestionGroup(
                body.timeLimit,
                body.randomizeAnswer,
                body.randomizeQuestion,
            ),
        );
    }
}
