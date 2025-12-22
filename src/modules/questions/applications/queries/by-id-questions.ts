import { Controller, Get, Injectable, Param } from '@nestjs/common';
import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { QuestionsReadRepository } from '../../repositories/question-read.repository';
import { QuestionGroupDto } from '../../dtos/question.dto';
import { basePath } from '../../questions.constants';

interface GetQuestionGroupResult {
    data: QuestionGroupDto;
}

export class GetQuestionGroup extends Query<GetQuestionGroupResult> {
    constructor(public readonly id: string) {
        super();
    }
}

@QueryHandler(GetQuestionGroup)
@Injectable()
export class GetQuestionGroupHandler implements IQueryHandler<GetQuestionGroup> {
    constructor(private readonly readRepository: QuestionsReadRepository) {}

    async execute(query: GetQuestionGroup): Promise<GetQuestionGroupResult> {
        const group = await this.readRepository.find(query.id);

        if (!group) {
            throw new Error(`QuestionGroup ${query.id} not found`);
        }

        return {
            data: group,
        };
    }
}

@Controller(basePath.questionGroups)
export class GetQuestionGroupEndpoint {
    constructor(private readonly queryBus: QueryBus) {}

    @Get(':id')
    async getGroup(@Param('id') id: string): Promise<GetQuestionGroupResult> {
        return this.queryBus.execute(new GetQuestionGroup(id));
    }
}
