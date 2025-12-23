import { z } from 'zod';
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

export class BaseQuestionAnswerDto {
    answer: string;
    isCorrect: boolean;
}

export const BaseQuestionAnswerSchema = z.object({
    answer: z.string().min(1),
    isCorrect: z.boolean(),
});

export const BaseQuestionSchema = z.object({
    number: z.number().int().min(1),
    question: z.string().min(1),
});