import { BaseQuestionAnswerSchema, BaseQuestionSchema } from "./question.dto";

import { z } from 'zod';

export const CreateMultipleChoiceSchema = BaseQuestionSchema.extend({
    type: z.literal('multiple-choice'),
    choices: z.array(BaseQuestionAnswerSchema).min(1),
});

export const CreateComplexChoiceSchema = BaseQuestionSchema.extend({
    type: z.literal('complex-choice'),
    choices: z.array(BaseQuestionAnswerSchema).min(1),
});

export const CreateEssaySchema = BaseQuestionSchema.extend({
    type: z.literal('essay'),
    answer: BaseQuestionAnswerSchema,
});

export const CreateQuestionSchema = z.discriminatedUnion('type', [
    CreateMultipleChoiceSchema,
    CreateComplexChoiceSchema,
    CreateEssaySchema,
]);

export type CreateQuestionAnswerDto = z.infer<typeof BaseQuestionAnswerSchema>;
export type CreateQuestionDto = z.infer<typeof CreateQuestionSchema>;
