import { IWorkSessionAnswer } from "./session";

class ComplexChoiceAnswer implements IWorkSessionAnswer {
    id: string;
    sessionId: string;
    questionId: string;

    value: string[];
}

export { ComplexChoiceAnswer }