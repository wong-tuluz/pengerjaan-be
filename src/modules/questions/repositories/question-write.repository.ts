import { Inject, Injectable } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { WRITE_DB } from '@/core/constants/db.constants';
import { IQuestion } from '../models/question';
import {
    questionAnswers,
    questionGroups,
    questions,
} from '@/modules/drizzle/schema';
import { QuestionAnswer } from '../models/question-answer';
import { eq, inArray, notInArray, sql, and } from 'drizzle-orm';

@Injectable()
export class QuestionsWriteRepository {
    constructor(@Inject(WRITE_DB) private readonly db: NeonHttpDatabase) {}

    async upsertGroup(groupId: string, timeLimit: number = 0) {
        await this.db
            .insert(questionGroups)
            .values({ id: groupId, timeLimit })
            .onConflictDoUpdate({
                target: questionGroups.id,
                set: { timeLimit },
            });
    }

    async upsertQuestion(groupId: string, question: IQuestion) {
        await this.db
            .insert(questions)
            .values({
                id: question.id,
                groupId,
                type: question.type,
                number: question.number,
                question: question.question,
            })
            .onConflictDoUpdate({
                target: questions.id,
                set: {
                    number: question.number,
                    question: question.question,
                    type: question.type,
                },
            });
    }

    async removeQuestion(questionId: string) {}

    async upsertQuestionAnswers(
        questionId: string,
        answers: QuestionAnswer[],
        pruneMissing = true,
    ) {
        if (answers.length === 0) {
            if (pruneMissing) {
                await this.db
                    .delete(questionAnswers)
                    .where(eq(questionAnswers.questionId, questionId));
            }
            return;
        }

        await this.db
            .insert(questionAnswers)
            .values(
                answers.map((a) => ({
                    id: a.id,
                    questionId,
                    answer: a.answer,
                    isCorrect: a.isCorrect,
                })),
            )
            .onConflictDoUpdate({
                target: questionAnswers.id,
                set: {
                    answer: sql`EXCLUDED.answer`,
                    isCorrect: sql`EXCLUDED.is_correct`,
                },
            });

        // Remove answers not included anymore
        if (pruneMissing) {
            const allowedIds = answers.map((a) => a.id);

            await this.db
                .delete(questionAnswers)
                .where(and(
                    eq(questionAnswers.questionId, questionId),
                    notInArray(questionAnswers.id, allowedIds),
                ));
        }
    }
}
