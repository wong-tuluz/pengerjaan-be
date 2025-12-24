import {
    Body,
    Controller,
    Delete,
    Param,
    Post,
    Put,
} from "@nestjs/common";
import { QuestionService } from "../application/question.service";
import type { QuestionType } from "../domain/question.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateQuestionGroupDto {
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
}

export class AddQuestionDto {
    @ApiProperty()
    type: QuestionType;

    @ApiProperty()
    prompt: string;

    @ApiProperty({type: () => [QuestionAnswerDto]})
    answers: QuestionAnswerDto[];
}

export class ModifyQuestionDto {
    @ApiProperty()
    type?: QuestionType;

    @ApiProperty()
    prompt?: string;

    @ApiProperty({type: () => [QuestionAnswerDto]})
    answers: QuestionAnswerDto[];
}

export class QuestionAnswerDto {
    @ApiProperty()
    value: string;

    @ApiProperty()
    isCorrect: boolean;
}


/**
 * Command-side controller
 * WRITE ONLY
 */
@Controller("api/question-groups")
export class QuestionCommandController {
    constructor(
        private readonly service: QuestionService
    ) { }

    /**
     * POST /api/question-groups
     */
    @Post()
    async createGroup(
        @Body() body: CreateQuestionGroupDto,
    ) {
        await this.service.createGroup(
            body.name,
            body.description,
        );
    }

    /**
     * DELETE /api/question-groups/:id
     */
    @Delete(":id")
    async removeGroup(
        @Param("id") id: string,
    ) {
        await this.service.removeGroup(id);
    }

    /**
     * POST /api/question-groups/:id/questions
     */
    @Post(":id/questions")
    async addQuestion(
        @Param("id") groupId: string,
        @Body() body: AddQuestionDto,
    ) {
        await this.service.addQuestion(
            groupId,
            body.type,
            body.prompt,
            body.answers,
        );
    }

    /**
     * PUT /api/question-groups/:id/questions/:questionId
     */
    @Put(":id/questions/:questionId")
    async modifyQuestion(
        @Param("questionId") questionId: string,
        @Body() body: ModifyQuestionDto,
    ) {
        await this.service.modifyQuestion(
            questionId,
            body.type ?? null,
            body.prompt ?? null,
            body.answers ?? null,
        );
    }

    /**
     * DELETE /api/question-groups/:id/questions/:questionId
     */
    @Delete(":id/questions/:questionId")
    async removeQuestion(
        @Param("questionId") questionId: string,
    ) {
        await this.service.removeQuestion(questionId);
    }
}
