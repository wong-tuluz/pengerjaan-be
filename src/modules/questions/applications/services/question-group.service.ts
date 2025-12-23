import { Injectable } from "@nestjs/common";
import { createQuestionGroup } from "../../models/question";
import { QuestionsWriteRepository } from "../../repositories/question-write.repository";
import { QuestionsReadRepository } from "../../repositories/question-read.repository";

@Injectable()
export class QuestionGroupService {
    constructor(
        private readonly writeRepo: QuestionsWriteRepository,
        private readonly readRepo: QuestionsReadRepository
    ) { }

    async find(id: string) {
        const group = await this.readRepo.find(id);

        if (!group) {
            throw new Error(`QuestionGroup ${id} not found`);
        }

        return {
            data: group,
        };
    }

    async findAll() {
        const groups = await this.readRepo.findAll();

        return {
            data: groups.map((g) => ({
                id: g.id,
                timeLimit: g.timeLimit,
                randomizeAnswer: g.randomizeAnswer,
                randomizeQuestion: g.randomizeQuestion
            })),
        };
    }

    async create(name: string, timeLimit: number, randomizeAnswer: boolean, randomizeQuestion: boolean) {
        const group = createQuestionGroup(
            name,
            timeLimit,
            randomizeAnswer,
            randomizeQuestion,
        );

        await this.writeRepo.upsertGroup(group);
    }

    async modify(id: string, data: { name: string, timeLimit: number, randomizeAnswer: boolean, randomizeQuestion: boolean }) {
        const group = await this.readRepo.find(id);
        if (group == null)
            throw new Error("")

        group.map(data)

        await this.writeRepo.upsertGroup(group);
    }
}