import { createZodDto } from "nestjs-zod";
import z from "zod";

const SessionQuestionAnswerSchema = z.object({
    jawabanSoalId: z.uuid().optional(),
    value: z.string(),
    isSelected: z.boolean(),
});

const SessionQuestionSchema = z.object({
    index: z.number(),
    soalId: z.uuid(),
    prompt: z.string(),
    type: z.enum(['multiple-choice', 'essay', 'single-choice']),
    isAnswered: z.boolean(),
    isMarked: z.boolean(),
    options: z.array(SessionQuestionAnswerSchema).optional(),
});

const SessionSchema = z.object({
    id: z.uuid(),
    status: z.enum(['active', 'completed', 'expired']),
    questions: z.array(SessionQuestionSchema),
});

const SessionResultQuestionAnswerSchema = z.object({
    jawabanSoalId: z.uuid().optional(),
    value: z.string(),
    isSelected: z.boolean(),
    isCorrect: z.boolean(),
});

const SessionResultQuestionSchema = z.object({
    index: z.number(),
    soalId: z.uuid(),
    prompt: z.string(),
    type: z.enum(['multiple-choice', 'essay', 'single-choice']),
    isAnswered: z.boolean(),
    isMarked: z.boolean(),
    options: z.array(SessionResultQuestionAnswerSchema).optional(),
});

const SessionResultSchema = z.object({
    id: z.uuid(),
    jadwalId: z.string(),
    paketSoalId: z.string(),
    status: z.enum(['in_progress', 'finished']),
    startedAt: z.date(),
    finishedAt: z.date().nullable(),
    questions: z.array(SessionResultQuestionSchema),
});

export class SessionQuestionState extends createZodDto(SessionQuestionSchema) { }

export class SessionDto extends createZodDto(SessionSchema) { }

export class SessionResultQuestionState extends createZodDto(SessionResultQuestionSchema) { }

export class SessionResultDto extends createZodDto(SessionResultSchema) { }
