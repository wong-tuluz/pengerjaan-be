import { TimeType } from "src/core/types/time-type"

type QuestionType = 'multiple-choice' | 'complex-multiple-choice'

interface IQuestion {
    id: string
    type: QuestionType
    number: number
    question: string
}

class QuestionGroup {
    public id: string;
    public questions: IQuestion[];
    public timeLimit: number = 0; // in seconds

    constructor(id: string) {
        this.id = id;
        this.questions = [];
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
}


export type { IQuestion, QuestionType, TimeType }
export { QuestionGroup }