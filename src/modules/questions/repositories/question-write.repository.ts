import { Inject, Injectable } from "@nestjs/common";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { WRITE_DB } from "src/core/constants/db.constants";
import { IQuestion } from "../models/question";
import { MultipleChoice } from "../models/multiple-choice";
import { ComplexChoice } from "../models/complex-choice";
import { questionAnswers, questionGroups, questions } from "src/modules/drizzle/schema";

@Injectable()
export class QuestionsWriteRepository {
    constructor(
        @Inject(WRITE_DB) private readonly db: NeonHttpDatabase
    ) { }

    async upsertGroup(groupId: string, timeLimitSeconds: number = 0) {
        await this.db
            .insert(questionGroups)
            .values({ id: groupId, timeLimitSeconds })
            .onConflictDoUpdate({
                target: questionGroups.id,
                set: { timeLimitSeconds }
            });
    }

    async upsertQuestion(groupId: string, question: IQuestion) {
        // Create correct runtime instance
        switch (question.type) {
            case "multiple-choice":
                question = new MultipleChoice(question.id, question.number);
                break;

            case "complex-multiple-choice":
                question = new ComplexChoice(question.id, question.number);
                break;

            default:
                throw new Error(`Unknown question type: ${question.type}`);
        }

        // // Upsert the question row
        // await this.db
        //     .insert(questions)
        //     .values({
        //         id: question.id,
        //         groupId,
        //         type: question.type,
        //         number: question.number,
        //         question: (question as any).question ?? ""
        //     })
        //     .onConflictDoUpdate({
        //         target: questions.id,
        //         set: {
        //             type: question.type,
        //             number: question.number,
        //             question: (question as any).question ?? ""
        //         }
        //     });

        // // If the question type includes choices
        // if ("choices" in question && question.choices?.length) {
        //     for (const choice of question.choices) {
        //         await this.db
        //             .insert(questionAnswers)
        //             .values({
        //                 id: choice.id,
        //                 questionId: question.id,
        //                 answer: choice.answer,
        //                 isCorrect: choice.isCorrect
        //             })
        //             .onConflictDoUpdate({
        //                 target: questionAnswers.id,
        //                 set: {
        //                     answer: choice.answer,
        //                     isCorrect: choice.isCorrect
        //                 }
        //             });
        //     }
        // }
    }

    async removeQuestion(questionId: string) {

    }

}