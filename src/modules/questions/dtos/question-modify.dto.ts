import { BaseQuestionAnswerDto, BaseQuestionDto } from "./question.dto";

export type ModifyQuestionAnswerDto = BaseQuestionAnswerDto & {
    id: string;
}

export type ModifyMultipleChoiceDto = BaseQuestionDto & {
    id: string;
    type: 'multiple-choice';
    choices: ModifyQuestionAnswerDto[];
};

export type ModifyComplexChoiceDto = BaseQuestionDto & {
    id: string;
    type: 'complex-choice';
    choices: ModifyQuestionAnswerDto[];
};

export type ModifyEssayDto = BaseQuestionDto & {
    id: string;
    type: 'essay';
    answer: ModifyQuestionAnswerDto;
};

export type ModifyQuestionDto =
    | ModifyMultipleChoiceDto
    | ModifyComplexChoiceDto
    | ModifyEssayDto;
