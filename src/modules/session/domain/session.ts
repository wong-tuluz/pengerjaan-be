import { Question } from "@/modules/questions/domain/question.entity";
import { v7 } from "uuid";

export class Session {
    id: string
    questionGroupId: string;
    questions: Question[];
    marks: SessionMarker[];
    answers: SessionAnswer[];

    // constructor(questions: Question[]) {
    //     this.questions = questions;
    //     this.marks = [];
    //     this.answers = [];
    // }

    /**
     * Submit answer for a question
     * For:
     *  - multiple-choice: answerId is required
     *  - complex-choice : answerId is required (can later support array)
     *  - essay:          value is required (text)
     */
    async submitAnswer(
        questionId: string,
        answerId?: string | null,
        value?: string | null,
    ) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question)
            throw new Error(`Question ${questionId} not found`);

        switch (question.type) {
            case "multiple-choice": {
                if (!answerId)
                    throw new Error("Multiple choice requires answerId");

                const choice = question.answers.find(a => a.id === answerId);
                if (!choice)
                    throw new Error(`Answer ${answerId} not found in question ${questionId}`);

                break;
            }

            case "complex-choice": {
                if (!answerId)
                    throw new Error("Complex choice requires answerId (TODO: support array)");
                break;
            }

            case "essay": {
                if (!value || value.trim().length === 0)
                    throw new Error("Essay requires written text");
                break;
            }
        }

        const existing = this.answers.find(a => a.questionId === questionId);
        if (existing) {
            existing.answerId = answerId ?? null;
            existing.value = value ?? null;
        } else {
            this.answers.push(new SessionAnswer(
                v7(),
                questionId,
                answerId ?? null,
                value ?? null,
            ));
        }
    }

    /**
     * Mark / unmark question as flagged by user
     */
    async markQuestion(questionId: string, isMarked: boolean) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question)
            throw new Error(`Question id ${questionId} not found`);

        const existing = this.marks.find(m => m.questionId === questionId);
        if (existing) {
            existing.isMarked = isMarked;
        } else {
            this.marks.push(new SessionMarker(v7(), questionId, isMarked))
        }
    }

    /**
     * Helper – get single answer
     */
    getAnswer(questionId: string): SessionAnswer | undefined {
        return this.answers.find(a => a.questionId === questionId);
    }

    /**
     * Helper – Determine if student finished answering
     */
    isCompleted(): boolean {
        return this.answers.length === this.questions.length;
    }

    /**
     * Helper – Count unanswered
     */
    unanswered(): number {
        return this.questions.length - this.answers.length;
    }
}

export class SessionAnswer {
    id: string
    questionId: string;
    answerId?: string | null;
    value?: string | null;


    constructor(id: string, questionId: string, answerId: string | null, value: string | null) {
        this.id = id
        this.questionId = questionId
        this.answerId = answerId
        this.value = value
    }
}

export class SessionMarker {
    id: string
    questionId: string;
    isMarked: boolean;

    constructor(id: string, questionId: string, isMarked: boolean) {
        this.id = id
        this.questionId = questionId
        this.isMarked = isMarked
    }
}
