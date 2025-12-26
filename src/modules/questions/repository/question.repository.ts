import { Inject, Injectable, Scope } from "@nestjs/common";
import { Question, QuestionAnswer } from "../domain/question.entity";
import { READ_DB, WRITE_DB } from "@/core/constants/db.constants";
import { MySql2Database } from "drizzle-orm/mysql2";
import { questionAnswers, questions } from "@/modules/drizzle/schema";
import { UnitOfWork } from "@/core/uow/uow";
import { eq, and } from "drizzle-orm";

@Injectable()
export class QuestionRepository {
    constructor(
        @Inject(READ_DB) private readonly readDb: MySql2Database,
        @Inject(WRITE_DB) private readonly writeDb: MySql2Database
    ) { }

    async find(groupId: string): Promise<Question[]> {
        const rows = await this.readDb
            .select({
                q: questions,
                a: questionAnswers,
            })
            .from(questions)
            .leftJoin(
                questionAnswers,
                eq(questionAnswers.questionId, questions.id),
            )
            .where(eq(questions.groupId, groupId));

        const questionMap = new Map<string, Question>();

        for (const row of rows) {
            let question = questionMap.get(row.q.id);

            if (!question) {
                question = new Question();
                question.map(row.q);
                question.answers = [];

                questionMap.set(row.q.id, question);
            }

            if (row.a) {
                const answer = new QuestionAnswer(
                    row.a.id,
                    row.a.questionId,
                    row.a.value,
                    row.a.isCorrect,
                );

                question.answers.push(answer);
            }
        }

        return Array.from(questionMap.values());
    }

    async findById(id: string): Promise<Question | null> {
        const rows = await this.readDb
            .select({
                q: questions,
                a: questionAnswers,
            })
            .from(questions)
            .leftJoin(
                questionAnswers,
                eq(questionAnswers.questionId, questions.id),
            )
            .where(
                and(
                    eq(questions.id, id),
                ),
            );

        if (rows.length === 0) {
            return null;
        }

        // --- hydrate aggregate ---
        const question = new Question();
        question.map(rows[0].q);
        question.answers = [];

        for (const row of rows) {
            if (!row.a) continue;

            const answer = new QuestionAnswer(
                row.a.id,
                row.a.questionId,
                row.a.value,
                row.a.isCorrect
            );

            question.answers.push(answer);
        }

        return question;
    }

    async upsert(uow: UnitOfWork, question: Question) {
        await uow.tx
            .insert(questions)
            .values(question)
            .onDuplicateKeyUpdate({
                set: {
                    prompt: question.prompt,
                    type: question.type
                },
            });
    }

    async delete(uow: UnitOfWork, id: string) {
        await uow.tx
            .delete(questions)
            .where(eq(questions.id, id))
    }
}
