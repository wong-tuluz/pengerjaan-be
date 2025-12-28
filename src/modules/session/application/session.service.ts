import { QuestionRepository } from '@/modules/questions/repository/question.repository';
import { Injectable } from '@nestjs/common';
import { Session, SessionAnswer } from '../domain/session';
import { Question } from '@/modules/questions/domain/question.entity';
import { SessionAnswerRepository } from '../repository/session-answer.repository';
import { UnitOfWorkService } from '@/core/uow/uow.service';
import { SessionRepository } from '../repository/session.repository';
import { SessionMarkRepository } from '../repository/session-mark.repository';

@Injectable()
export class SessionService {
    constructor(
        private readonly questionRepo: QuestionRepository,
        private readonly answerRepo: SessionAnswerRepository,
        private readonly sessionRepo: SessionRepository,
        private readonly markRepo: SessionMarkRepository,
        private readonly uow: UnitOfWorkService,
    ) {}

    async createSession(timeLimit: number) {
        const session = Session.create(timeLimit);

        await this.uow.run(async (uow) => {
            await this.sessionRepo.upsert(uow, session);
        });
    }

    async submitAnswer(
        sessionId: string,
        questionId: string,
        answers: {
            answerId?: string | null;
            value?: string | null;
        }[],
    ) {
        const session = await this.sessionRepo.findById(sessionId);
        if (!session) throw new Error(`Session ${sessionId} not found`);

        const question = await this.questionRepo.findById(questionId);
        if (!question) throw new Error(`Question ${questionId} not found`);

        const created = answers.map((a) =>
            SessionAnswer.create(
                session.id,
                question.id,
                a.answerId ?? null,
                a.value ?? null,
            ),
        );

        this.verifyAnswers(question, created);

        session.submitAnswer(created);

        await this.uow.run(async (uow) => {
            await this.answerRepo.deleteByQuestion(
                uow,
                session.id,
                question.id,
            );

            for (const a of created) {
                await this.answerRepo.upsert(uow, session.id, a);
            }
        });
    }

    async markQuestion(sessionId: string, questionId: string, value: boolean) {
        const session = await this.sessionRepo.findById(sessionId);
        if (!session) throw new Error(`Session ${sessionId} not found`);

        const question = await this.questionRepo.findById(questionId);
        if (!question) throw new Error(`Question ${questionId} not found`);

        session.marks = await this.markRepo.findBySession(session.id);

        session.markQuestion(question.id, value);

        await this.uow.run(async (uow) => {
            for (const m of session.marks) {
                await this.markRepo.upsert(uow, m);
            }
        });
    }

    /**
     * Ensure submitted answers conform to the question type.
     */
    private verifyAnswers(
        question: Question,
        answers: { answerId?: string | null; value?: string | null }[],
    ) {
        switch (question.type) {
            case 'multiple-choice': {
                if (answers.length === 0)
                    throw new Error(
                        'Multiple choice requires at least one answer',
                    );
                if (answers.length > 1)
                    throw new Error(
                        'Multiple choice allows exactly one answer',
                    );

                const { answerId } = answers[0];
                if (!answerId)
                    throw new Error('Multiple choice requires answerId');

                const choice = question.answers.find((a) => a.id === answerId);
                if (!choice)
                    throw new Error(
                        `Answer ${answerId} not found in question ${question.id}`,
                    );

                break;
            }

            case 'complex-choice': {
                if (answers.length === 0)
                    throw new Error(
                        'Complex choice requires at least one answer',
                    );

                const ids = answers
                    .map((a) => a.answerId)
                    .filter((id): id is string => !!id);

                if (ids.length !== answers.length)
                    throw new Error(
                        'Complex choice requires answerId for each answer',
                    );

                const uniqueIds = new Set(ids);
                if (uniqueIds.size !== ids.length)
                    throw new Error(
                        'Duplicate answers are not allowed for complex choice',
                    );

                for (const id of ids) {
                    const choice = question.answers.find((a) => a.id === id);
                    if (!choice)
                        throw new Error(
                            `Answer ${id} not found in question ${question.id}`,
                        );
                }
                break;
            }

            case 'essay': {
                if (answers.length === 0)
                    throw new Error('Essay requires an answer');

                if (answers.length > 1)
                    throw new Error('Essay allows exactly one answer');

                const { value, answerId } = answers[0];

                if (!value || value.trim().length === 0)
                    throw new Error('Essay requires written text');

                if (answerId) throw new Error('Essay should not have answerId');

                break;
            }

            default: {
                throw new Error(`Unsupported question type: ${question.type}`);
            }
        }
    }
}
