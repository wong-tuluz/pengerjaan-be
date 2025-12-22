import { IQuestion, TimeType } from '@/modules/questions/models/question';
import { IWorkSessionAnswer } from '../models/session';

export interface WorkSessionDto {
    id: string;
    questionGroupId: string;
    sessionStart: Date;
    timeLimit: number;
    timeUsed: number;
    timeType: TimeType;
    sessionEnd?: Date | null;
    questionStates: WorkSessionQuestionStateDto[];
}

export interface WorkSessionQuestionStateDto {
    question: IQuestion;
    marked: boolean;
    answer?: IWorkSessionAnswer | null;
}
