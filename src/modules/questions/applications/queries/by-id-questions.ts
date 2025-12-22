import { Inject } from "@nestjs/common";
import { IQueryHandler, Query, QueryHandler } from "@nestjs/cqrs";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { READ_DB, WRITE_DB } from "src/core/constants/db.constants";

class QuestionGroupResult {
}

export class GetQuestionGroup extends Query<QuestionGroupResult> {
    constructor(public readonly id: string) {
        super();
    }
}


@QueryHandler(GetQuestionGroup)
export class GetQuestionGroupHandler implements IQueryHandler<GetQuestionGroup> {
    constructor() 
    { }
    
    execute(query: GetQuestionGroup): Promise<QuestionGroupResult> {
        

        throw new Error("Method not implemented.");
    }
}