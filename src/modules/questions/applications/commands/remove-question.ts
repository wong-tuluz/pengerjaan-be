import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsWriteRepository } from '../../repositories/question-write.repository';

interface RemoveQuestionResult {}

export class RemoveQuestion extends Command<RemoveQuestionResult> {
    constructor(public readonly questionId: string) {
        super();
    }
}

@CommandHandler(RemoveQuestion)
export class RemoveQuestionHandler implements ICommandHandler<RemoveQuestion> {
    constructor(private readonly repo: QuestionsWriteRepository) {}

    async execute(command: RemoveQuestion): Promise<RemoveQuestionResult> {
        await this.repo.removeQuestion(command.questionId);

        return {};
    }
}
