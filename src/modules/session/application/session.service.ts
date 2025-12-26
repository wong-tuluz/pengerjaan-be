import { QuestionRepository } from "@/modules/questions/repository/question.repository";
import { Injectable } from "@nestjs/common";
import { Session } from "../domain/session";

@Injectable()
export class SessionService {
    constructor(
        private readonly questionRepo: QuestionRepository
    ) { }

    async createSession() {
        // check if user already attempted a session
    }

    async submitAnswer(sessionId: string, questionId: string, answerId?: string | null, value?: string | null,) {
        const session = new Session() // fetch session from id

        const questions = await this.questionRepo.find(session.questionGroupId)

        questions.forEach(q => {
            session.questions.push(q)
        });

        session.submitAnswer(questionId, answerId, value)
    }
}