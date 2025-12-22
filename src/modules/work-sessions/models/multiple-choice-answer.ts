import { IWorkSessionAnswer } from "./session";

class MultipleChoiceAnswer implements IWorkSessionAnswer {
    id: string;
    sessionId: string;
    questionId: string;

    value: string;
}

export { MultipleChoiceAnswer }