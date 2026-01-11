export interface SubmitContract {
    id: string;
    sessionId: string;
    questionId: string;
    answerId?: string | null;
    answerText?: string | null;
    marked?: boolean | null;
}
