import { IQuestion, QuestionType } from './question';
import { QuestionAnswer } from './question-answer';

class MultipleChoice implements IQuestion {
    id: string;
    type: QuestionType;
    number: number;
    question: string;

    choices: QuestionAnswer[];

    constructor(id: string, number: number) {
        this.id = id;
        this.type = 'multiple-choice';
        this.number = number;
    }
}

export { MultipleChoice };
