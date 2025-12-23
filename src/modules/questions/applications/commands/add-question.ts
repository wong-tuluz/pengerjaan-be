import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsWriteRepository } from '../../repositories/question-write.repository';
import { CreateQuestionDto } from '../../dtos/question-create.dto';
import { createQuestionAnswer } from '../../models/question-answer';
import { createMultipleChoice } from '../../models/multiple-choice';
import { createComplexChoice } from '../../models/complex-choice';
import { createEssay } from '../../models/essay';

interface AddQuestionResult { }

export class AddQuestion extends Command<AddQuestionResult> {
    constructor(
        public readonly groupId: string,
        public readonly question: CreateQuestionDto,
    ) {
        super();
    }
}

@CommandHandler(AddQuestion)
export class AddQuestionHandler implements ICommandHandler<AddQuestion> {
    constructor(
        private readonly repo: QuestionsWriteRepository,
    ) { }

    async execute(command: AddQuestion): Promise<AddQuestionResult> {
        switch (command.question.type) {
            case 'multiple-choice': {
                const answers = command.question.choices.map(c => createQuestionAnswer(c.answer, c.isCorrect));
                const question = createMultipleChoice(command.question.number, command.question.question, answers)

                await this.repo.upsertQuestion(command.groupId, question);
                await this.repo.upsertQuestionAnswers(question.id, answers);
                break;
            }

            case 'complex-choice': {
                const answers = command.question.choices.map(c => createQuestionAnswer(c.answer, c.isCorrect));
                const question = createComplexChoice(command.question.number, command.question.question, answers)

                await this.repo.upsertQuestion(command.groupId, question);
                await this.repo.upsertQuestionAnswers(question.id, answers);
                break;
            }

            case 'essay': {
                const answer = createQuestionAnswer(command.question.answer.answer, true);
                const question = createEssay(command.question.number, command.question.question, answer)


                await this.repo.upsertQuestion(command.groupId, question);
                await this.repo.upsertQuestionAnswers(question.id, [answer]);
            }
        }

        return {};
    }
}
