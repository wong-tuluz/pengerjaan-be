import { Injectable, Controller, Get } from '@nestjs/common';
import { QueryHandler, IQueryHandler, QueryBus, Query } from '@nestjs/cqrs';
import { QuestionsReadRepository } from '../../repositories/question-read.repository';
import { QuestionGroupDto } from '../../dtos/question.dto';
import { basePath } from '../../questions.constants';

interface GetAllQuestionGroupResult {
    data: Omit<QuestionGroupDto, 'questions'>[];
}

export class GetAllQuestionGroup extends Query<GetAllQuestionGroupResult> {
    constructor() {
        super();
    }
}

@QueryHandler(GetAllQuestionGroup)
@Injectable()
export class GetAllQuestionGroupHandler implements IQueryHandler<GetAllQuestionGroup> {
    constructor(private readonly readRepository: QuestionsReadRepository) {}

    async execute(
        query: GetAllQuestionGroup,
    ): Promise<GetAllQuestionGroupResult> {
        const groups = await this.readRepository.findAll();

        return {
            data: groups.map((g) => ({
                id: g.id,
                timeLimit: g.timeLimit,
                randomizeAnswer: g.randomizeAnswer,
                randomizeQuestion: g.randomizeQuestion
            })),
        };
    }
}

@Controller(basePath.questionGroups)
export class GetAllQuestionGroupEndpoint {
    constructor(private readonly queryBus: QueryBus) {}

    @Get()
    async getGroup(): Promise<GetAllQuestionGroupResult> {
        return this.queryBus.execute(new GetAllQuestionGroup());
    }
}
