import { UnitOfWork } from '@/core/uow/uow';
import { sessionAnswers } from '@/modules/drizzle/schema';
import { SessionAnswer } from '../domain/session';
import { and, eq } from 'drizzle-orm';
import { READ_DB } from '@/core/constants/db.constants';
import { Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';

export class SessionAnswerRepository {
    constructor(@Inject(READ_DB) private readonly readDb: MySql2Database) {}

    async upsert(uow: UnitOfWork, sessionId: string, answer: SessionAnswer) {
        await uow.tx
            .insert(sessionAnswers)
            .values({
                id: answer.id,
                sessionId: sessionId,
                questionId: answer.questionId,
                answerId: answer.answerId,
                value: answer.value,
            })
            .onDuplicateKeyUpdate({
                set: {
                    answerId: answer.answerId,
                    value: answer.value,
                },
            });
    }

    async deleteByQuestion(
        uow: UnitOfWork,
        sessionId: string,
        questionId: string,
    ) {
        await uow.tx
            .delete(sessionAnswers)
            .where(
                and(
                    eq(sessionAnswers.sessionId, sessionId),
                    eq(sessionAnswers.questionId, questionId),
                ),
            );
    }
}
