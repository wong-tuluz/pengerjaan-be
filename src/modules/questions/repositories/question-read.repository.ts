import { Inject, Injectable } from '@nestjs/common';
import { READ_DB } from '@/core/constants/db.constants';
import { IQuestion, QuestionGroup } from '../models/question';
import {
    questionAnswers,
    questionGroups,
    questions,
} from '@/modules/drizzle/schema';
import { eq, inArray, asc } from 'drizzle-orm';
import { QuestionAnswer } from '../models/question-answer';
import { MultipleChoice } from '../models/multiple-choice';
import { ComplexChoice } from '../models/complex-choice';
import { Essay } from '../models/essay';
import { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class QuestionsReadRepository {
    constructor(@Inject(READ_DB) private readonly readDb: MySql2Database) { }

    async findAll(): Promise<QuestionGroup[]> {
        const groupRows = await this.readDb
            .select()
            .from(questionGroups)
            .execute();

        return groupRows.map((row) => {
            const group = new QuestionGroup(row.id);

            group.map(row);

            return group;
        });
    }

    async find(groupId: string): Promise<QuestionGroup | null> {
        const [groupRow] = await this.readDb
            .select()
            .from(questionGroups)
            .where(eq(questionGroups.id, groupId))
            .execute();

        if (!groupRow) return null;

        const group = new QuestionGroup(groupRow.id);
        group.map(groupRow);

        const questionRows = await this.readDb
            .select()
            .from(questions)
            .where(eq(questions.groupId, groupId))
            .orderBy(asc(questions.number))
            .execute();

        if (questionRows.length === 0) return group;

        const questionIds = questionRows.map((q) => q.id);

        const answerRows = await this.readDb
            .select()
            .from(questionAnswers)
            .where(inArray(questionAnswers.questionId, questionIds))
            .execute();

        const answersByQuestion = new Map<string, QuestionAnswer[]>();

        for (const row of answerRows) {
            const answer = new QuestionAnswer(row.id);
            answer.map(row);

            const list = answersByQuestion.get(row.questionId) ?? [];
            list.push(answer);
            answersByQuestion.set(row.questionId, list);
        }


        for (const row of questionRows) {
            const question = this.createQuestion(row);

            if (
                question instanceof MultipleChoice ||
                question instanceof ComplexChoice
            ) {
                question.choices = answersByQuestion.get(row.id) ?? [];
            }

            if (question instanceof Essay) {
                question.answer = (answersByQuestion.get(row.id) ?? [])[0]
            }

            group.questions.push(question);
        }

        return group;
    }

    async findQuestionAnswers(questionId: string): Promise<QuestionAnswer[]> {
        const rows = await this.readDb
            .select()
            .from(questionAnswers)
            .where(eq(questionAnswers.questionId, questionId))
            .execute();

        return rows.map((row) => {
            const answer = new QuestionAnswer(row.id);
            answer.map(row);
            return answer;
        });
    }

    private createQuestion(row: any): IQuestion {
        switch (row.type) {
            case 'multiple-choice': {
                const q = new MultipleChoice(row.id);
                q.number = row.number;
                q.question = row.question;
                return q;
            }

            case 'complex-multiple-choice': {
                const q = new ComplexChoice(row.id);
                q.number = row.number;
                q.question = row.question;
                return q;
            }

            case 'essay': {
                const q = new Essay(row.id);
                q.number = row.number;
                q.question = row.question;
                return q;
            }

            default:
                throw new Error(`Unknown question type: ${row.type}`);
        }
    }
}
