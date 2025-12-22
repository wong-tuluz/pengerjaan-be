class WorkSession {
    public id: string;
    public questionGroupId: string;
    public sessionStart: Date;
    public sessionEnd?: Date | null;

    public constructor(id: string, questionGroupId: string) {
        this.id = id;
        this.questionGroupId = questionGroupId;
    }
}

interface IWorkSessionAnswer {
    id: string;
    sessionId: string;
    questionId: string;

    value: unknown;
}

export type { IWorkSessionAnswer };
export { WorkSession };
