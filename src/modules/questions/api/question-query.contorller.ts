import {
    Controller,
    Get,
    Param,
    NotFoundException,
} from "@nestjs/common";
import { QuestionService } from "../application/question.service";
import { QuestionGroupRepository } from "../repository/question-group.repository";
import { QuestionRepository } from "../repository/question.repository";
import { QuestionAnswerRepository } from "../repository/question-answer.repository";

@Controller("api/question-groups")
export class QuestionQueryController {
    constructor(
        private readonly groupRepo: QuestionGroupRepository,
        private readonly questionRepo: QuestionRepository,
        private readonly answerRepo: QuestionAnswerRepository
    ) {}

    /**
     * GET /api/question-groups
     */
    @Get()
    async get() {
        return this.groupRepo.find();
    }

    /**
     * GET /api/question-groups/:id
     */
    @Get(":id")
    async getById(
        @Param("id") id: string,
    ) {
        const group = await this.groupRepo.findById(id);

        if (!group) {
            throw new NotFoundException(`Question group ${id} not found`);
        }

        return group;
    }

    /**
     * GET /api/question-groups/:id/questions
     */
    @Get(":id/questions")
    async getQuestions(
        @Param("id") groupId: string,
    ) {
        const group = await this.groupRepo.findById(groupId);

        if (!group) {
            throw new NotFoundException(`Question group ${groupId} not found`);
        }

        return this.questionRepo.find(group.id);
    }

    /**
     * GET /api/question-groups/:id/questions/:questionId
     */
    @Get(":id/questions/:questionId")
    async getQuestionById(
        @Param("id") groupId: string,
        @Param("questionId") questionId: string,
    ) {
        const group = await this.groupRepo.findById(groupId);

        if (!group) {
            throw new NotFoundException(`Question group ${groupId} not found`);
        }

        const question = await this.questionRepo.findById(questionId);

        if (!question || question.groupId !== group.id) {
            throw new NotFoundException(`Question ${questionId} not found in group ${groupId}`);
        }

        const answers = await this.answerRepo.find(question.id);

        answers.forEach(a => {
            question.answers.push(a)
        });


        return question;
    }
}
