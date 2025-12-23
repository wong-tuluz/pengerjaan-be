import { v7 } from "uuid";

export class QuestionAnswer {
    public readonly id: string;
    public answer: string;
    public isCorrect: boolean;

    constructor(id: string) {
        this.id = id
    }

    public map(data: { answer: string, isCorrect: boolean }) {
        this.answer = data.answer
        this.isCorrect = data.isCorrect
    }
}

export function createQuestionAnswer(answer: string, isCorrect: boolean): QuestionAnswer {
    const obj = new QuestionAnswer(v7())

    obj.answer = answer
    obj.isCorrect = isCorrect

    return obj
}
