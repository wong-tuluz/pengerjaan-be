import { TimeType } from '@/core/types/time-type';
import { v7 } from 'uuid';

type QuestionType = 'multiple-choice' | 'complex-choice' | 'essay';

interface IQuestion {
    id: string;
    type: QuestionType;
    number: number;
    question: string;
}

class QuestionGroup {
    public readonly id: string;
    public questions: IQuestion[];
    public timeLimit: number = 0; // in seconds
    public name: string

    public randomizeAnswer: boolean;
    public randomizeQuestion: boolean;

    constructor(id: string) {
        this.id = id;
    }

    setTimeLimit(value: number, type: TimeType) {
        switch (type) {
            case 'hour':
                this.timeLimit = value * 3600;
                break;
            case 'minute':
                this.timeLimit = value * 60;
                break;
            case 'second':
                this.timeLimit = value;
                break;
        }
    }

    map(data: {
        name: string;
        timeLimit: number;
        randomizeAnswer: boolean;
        randomizeQuestion: boolean;
    }) {
        this.name = data.name;
        this.timeLimit = data.timeLimit;
        this.randomizeAnswer = data.randomizeAnswer;
        this.randomizeQuestion = data.randomizeQuestion;
    }
}

export function createQuestionGroup(
    name: string,
    timeLimit: number = 0,
    randomizeAnswer: boolean = true,
    randomizeQuestion: boolean = true,
): QuestionGroup {
    const group = new QuestionGroup(v7());

    group.map({
        name,
        timeLimit,
        randomizeAnswer,
        randomizeQuestion,
    });

    return group;
}

export type { IQuestion, QuestionType, TimeType };
export { QuestionGroup };
