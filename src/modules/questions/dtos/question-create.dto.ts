import { BaseQuestionAnswerDto, BaseQuestionDto } from "./question.dto";


export type CreateQuestionAnswerDto = BaseQuestionAnswerDto

export type CreateMultipleChoiceDto = BaseQuestionDto & {
    type: 'multiple-choice';
    choices: CreateQuestionAnswerDto[];
};

export type CreateComplexChoiceDto = BaseQuestionDto & {
    type: 'complex-choice';
    choices: CreateQuestionAnswerDto[];
};

export type CreateEssayDto = BaseQuestionDto & {
    type: 'essay';
    answer: CreateQuestionAnswerDto;
};

export type CreateQuestionDto =
    | CreateMultipleChoiceDto
    | CreateComplexChoiceDto
    | CreateEssayDto;
