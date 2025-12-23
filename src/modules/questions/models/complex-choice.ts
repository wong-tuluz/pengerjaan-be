import { v7 } from 'uuid';
import { IQuestion, QuestionType } from './question';
import { QuestionAnswer } from './question-answer';

export class ComplexChoice implements IQuestion {
    id: string;
    type: QuestionType = 'complex-choice';
    number: number;
    question: string;

    choices: QuestionAnswer[];

    public map(data: {
        number: number,
        question: string,
        choices: QuestionAnswer[]
    }) {
        this.number = data.number
        this.question = data.question
        this.choices = data.choices
    }

    constructor(id: string) {
        this.id = id;
    }
}

export function createComplexChoice(number: number, question: string, choices: QuestionAnswer[]): ComplexChoice {
    const questions = new ComplexChoice(v7())

    questions.number = number
    questions.question = question
    questions.choices = choices

    return questions
}
