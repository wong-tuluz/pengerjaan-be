import { z } from 'zod';

export const CreateQuestionGroupSchema = z.object({
    name: z.string(),
    timeLimit: z.number().int().min(0),
    randomizeAnswer: z.boolean(),
    randomizeQuestion: z.boolean(),
});

export type CreateQuestionGroupDto = z.infer<typeof CreateQuestionGroupSchema>;