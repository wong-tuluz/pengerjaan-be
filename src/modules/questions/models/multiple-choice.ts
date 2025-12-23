import { v7 } from 'uuid';
import { IQuestion, QuestionType } from './question';
import { QuestionAnswer } from './question-answer';

export class MultipleChoice implements IQuestion {
    id: string;
    type: QuestionType = 'multiple-choice';
    number: number;
    question: string;

    choices: QuestionAnswer[];

    public assertSingleCorrectAnswer() {
        const correctCount = this.choices.filter(c => c.isCorrect).length;

        if (correctCount !== 1) {
            throw new Error(
                `MultipleChoice question must have exactly 1 correct answer, found ${correctCount}`,
            );
        }
    }

    constructor(id: string) {
        this.id = id;
    }
}

export function createMultipleChoice(number: number, question: string, choices: QuestionAnswer[]): MultipleChoice {
    const questions = new MultipleChoice(v7())

    questions.number = number
    questions.question = question
    questions.choices = choices

    questions.assertSingleCorrectAnswer()

    return questions
}
