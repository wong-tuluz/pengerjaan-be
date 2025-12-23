import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { basePath } from '../questions.constants';
import { ZodValidationPipe } from '@/core/zod-validation.pipe';
import { ZodBody, ZodResponse } from '@/core/zod-endpoint.decorator';
import { CreateQuestionGroupSchema } from '../dtos/question-group-create.dto';
import type { CreateQuestionGroupDto } from '../dtos/question-group-create.dto';
import z from 'zod';
import { QuestionGroupService } from '../applications/services/question-group.service';

@Controller(basePath.questionGroups)
export class QuestionGroupsController {
    constructor(
        private readonly service: QuestionGroupService,
    ) { }

    @Post()
    @ZodBody(CreateQuestionGroupSchema)
    @ZodResponse(z.object({}))
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body(new ZodValidationPipe(CreateQuestionGroupSchema))
        body: CreateQuestionGroupDto,
    ) {
        return this.service.create(
            body.name,
            body.timeLimit,
            body.randomizeAnswer,
            body.randomizeQuestion
        )
    }

    @Put(':id')
    async modify(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(CreateQuestionGroupSchema))
        body: CreateQuestionGroupDto,
    ) {
        return this.service.modify(
            id,
            body
        )
    }

    @Get()
    async getAllGroup() {
        return await this.service.findAll();
    }

    @Get(':id')
    async getGroupById(@Param('id') id: string) {
        return await this.service.find(id);
    }
}