import { Module } from "@nestjs/common";
import { QuestionModule } from "../questions/question.module";

@Module({
    imports: [QuestionModule]
})
export class SessionModule { }