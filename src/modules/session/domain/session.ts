import { v7 as uuidv7 } from 'uuid';

export type SessionStatus = 'in_progress' | 'finished';

export class Session {
    readonly id: string;
    readonly timeLimit: number;
    readonly startedAt: Date;
    finishedAt?: Date | null;
    status: SessionStatus;
    answers: SessionAnswer[];
    marks: SessionMarker[];

    constructor(
        id: string,
        timeLimit: number,
        startedAt: Date,
        status: SessionStatus,
        answers: SessionAnswer[],
        marks: SessionMarker[],
        finishedAt?: Date | null,
    ) {
        this.id = id;
        this.timeLimit = timeLimit;
        this.startedAt = startedAt;
        this.status = status;
        this.answers = answers;
        this.marks = marks;
        this.finishedAt = finishedAt;
    }

    static create(timeLimit: number): Session {
        return new Session(
            uuidv7(),
            timeLimit,
            new Date(),
            'in_progress',
            [],
            [],
            undefined,
        );
    }

    finish(): void {
        if (this.status === 'finished') return;

        this.status = 'finished';
        this.finishedAt = new Date();
    }

    submitAnswer(answers: SessionAnswer[]) {
        this.ensureCanAnswer();

        for (const a of answers) {
            this.answers.push(a);
        }
    }

    markQuestion(questionId: string, isMarked: boolean): void {
        this.ensureInProgress();

        const existing = this.marks.find((m) => m.questionId === questionId);
        if (existing) {
            existing.isMarked = isMarked;
            return;
        }

        this.marks.push(
            new SessionMarker(uuidv7(), this.id, questionId, isMarked),
        );
    }

    private ensureCanAnswer(): void {
        this.ensureInProgress();
        if (this.isExpired()) {
            throw new Error('Session expired – cannot submit answers');
        }
    }

    private ensureInProgress(): void {
        if (this.status !== 'in_progress') {
            throw new Error('Session not active');
        }
    }

    private isExpired(): boolean {
        if (!this.timeLimit) return false;
        const expiresAt = new Date(
            this.startedAt.getTime() + this.timeLimit * 60 * 1000,
        );
        return new Date() > expiresAt;
    }
}

export class SessionAnswer {
    constructor(
        public id: string,
        public sesionId: string,
        public questionId: string,
        public answerId: string | null,
        public value: string | null,
    ) {}

    static create(
        sessionId: string,
        questionId: string,
        answerId: string | null,
        value: string | null,
    ) {
        return new SessionAnswer(
            uuidv7(),
            sessionId,
            questionId,
            answerId,
            value,
        );
    }
}

export class SessionMarker {
    constructor(
        public id: string,
        public sessionId: string,
        public questionId: string,
        public isMarked: boolean,
    ) {}
}
