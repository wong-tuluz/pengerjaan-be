import { v7 } from 'uuid';
import { IQuestion, QuestionType } from './question';
import { QuestionAnswer } from './question-answer';

export class Essay implements IQuestion {
    id: string;
    type: QuestionType = 'essay';
    number: number;
    question: string;

    answer: QuestionAnswer;

        public map(data: {
        number: number,
        question: string,
        answer: QuestionAnswer
    }) {
        this.number = data.number
        this.question = data.question
        this.answer = data.answer
    }

    constructor(id: string) {
        this.id = id;
    }
}

export function createEssay(number: number, question: string, answer: QuestionAnswer): Essay {
    const questions = new Essay(v7())

    questions.number = number
    questions.question = question
    questions.answer = answer

    return questions
}
