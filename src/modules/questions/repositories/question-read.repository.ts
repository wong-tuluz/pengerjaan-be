import { Inject, Injectable } from "@nestjs/common";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { READ_DB } from "src/core/constants/db.constants";
import { IQuestion, QuestionGroup } from "../models/question";
import { questionAnswers, questionGroups, questions } from "src/modules/drizzle/schema";
import { eq } from "drizzle-orm";
import { QuestionAnswer } from "../models/question-answer";
import { MultipleChoice } from "../models/multiple-choice";
import { ComplexChoice } from "../models/complex-choice";

@Injectable()
export class QuestionsReadRepository {
    constructor(
        @Inject(READ_DB) private readonly readDb: NeonHttpDatabase
    ) { }

    async find(groupId: string): Promise<QuestionGroup | null> {
        const [groupRow] = await this.readDb
            .select()
            .from(questionGroups)
            .where(eq(questionGroups.id, groupId));

        if (!groupRow) return null;

        const group = new QuestionGroup(groupRow.id);
        group.timeLimit = groupRow.timeLimitSeconds;

        const questionRows = await this.readDb
            .select()
            .from(questions)
            .where(eq(questions.groupId, groupId));

        for (const row of questionRows) {
            let question: IQuestion;

            switch (row.type) {
                case 'multiple-choice':
                    question = new MultipleChoice(row.id, row.number);
                    break;

                case 'complex-multiple-choice':
                    question = new ComplexChoice(row.id, row.number);
                    break;

                default:
                    throw new Error(`Unknown question type: ${row.type}`);
            }
            question.question = row.question;

            group.questions.push(question);
        }

        return group;
    }

    async findQuestionAnswers(questionId: string): Promise<QuestionAnswer[]> {
        const rows = await this.readDb
            .select()
            .from(questionAnswers)
            .where(eq(questionAnswers.questionId, questionId));

        return rows.map(r => {
            const ans = new QuestionAnswer();
            ans.id = r.id;
            ans.answer = r.answer;
            ans.isCorrect = r.isCorrect;
            return ans;
        });
    }
}
