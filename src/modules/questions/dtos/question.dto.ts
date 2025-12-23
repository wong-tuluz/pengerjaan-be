import { QuestionType } from "../models/question";

export interface QuestionGroupDto {
    id: string;
    questions: any[];
    timeLimit: number;
    randomizeAnswer: boolean;
    randomizeQuestion: boolean;
}

export interface BaseQuestionDto {
    type: QuestionType;
    number: number;
    question: string;
}

export interface BaseQuestionAnswerDto {
    answer: string;
    isCorrect: boolean;
}