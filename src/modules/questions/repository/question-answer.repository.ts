import { READ_DB, WRITE_DB } from "@/core/constants/db.constants";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { QuestionAnswer } from "../domain/question.entity";
import { questionAnswers } from "@/modules/drizzle/schema";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { UnitOfWork } from "@/core/uow/uow";

@Injectable()
export class QuestionAnswerRepository {
    constructor(
        @Inject(READ_DB) private readonly readDb: MySql2Database,
        @Inject(WRITE_DB) private readonly writeDb: MySql2Database
    ) { }

    async find(questionId: string) {
        const rows = await this.readDb
            .select()
            .from(questionAnswers)
            .where(eq(questionAnswers.questionId, questionId))
            .execute();

        return rows.map((row) => {
            const answer = new QuestionAnswer(
                row.id,
                row.questionId,
                row.value,
                row.isCorrect
            );
            return answer;
        });
    }

    async upsert(
        uow: UnitOfWork,
        questionId: string,
        answers: QuestionAnswer[],
    ) {
        const db = uow.tx;

        await db
            .delete(questionAnswers)
            .where(eq(questionAnswers.questionId, questionId))
            .execute();

        if (answers.length === 0) return;

        await db
            .insert(questionAnswers)
            .values(
                answers.map(a => ({
                    id: a.id,
                    questionId,
                    value: a.value,
                    isCorrect: a.isCorrect,
                })),
            )
            .execute();
    }
}