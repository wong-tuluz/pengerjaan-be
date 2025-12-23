import { Controller, Post } from "@nestjs/common";
import { basePath } from "../questions.constants";
import { QuestionService } from "../applications/services/question.service";

@Controller(basePath.questions)
export class QuestionController {
    constructor(
        private readonly service: QuestionService,
    ) { }

}