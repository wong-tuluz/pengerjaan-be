import { v7 as uuidv7 } from 'uuid';

export type SessionStatus = 'in_progress' | 'finished';

export class WorkSession {
    id: string;
    siswaId: string;
    jadwalId: string;
    paketSoalId: string;
    materiSoalId?: string | null;
    timeLimit: number;
    startedAt: Date;
    finishedAt?: Date | null;
    status: SessionStatus;
    answers: WorkSessionJawaban[];
    marks: WorkSessionMarker[];

    static create(
        siswaId: string,
        jadwalId: string,
        timeLimit: number,
        paketSoalId: string,
        materiSoalId?: string | null,
    ): WorkSession {
        const obj = new WorkSession();

        obj.id = uuidv7();
        obj.siswaId = siswaId;
        obj.jadwalId = jadwalId;
        obj.paketSoalId = paketSoalId;
        obj.materiSoalId = materiSoalId
        obj.timeLimit = timeLimit;
        obj.startedAt = new Date();
        obj.status = 'in_progress';
        obj.answers = [];
        obj.marks = [];

        return obj;
    }

    public map(data: Partial<WorkSession>) {
        this.id = data.id ?? this.id;
        this.jadwalId = data.jadwalId ?? this.jadwalId;
        this.timeLimit = data.timeLimit ?? this.timeLimit;
        this.startedAt = data.startedAt ?? this.startedAt;
        this.status = data.status ?? this.status;
        this.finishedAt = data.finishedAt ?? this.finishedAt;
    }

    finish(): void {
        if (this.status === 'finished') return;

        this.status = 'finished';
        this.finishedAt = new Date();
    }

    submitAnswer(answers: WorkSessionJawaban[]) {
        this.ensureCanAnswer();

        for (const a of answers) {
            this.answers.push(a);
        }
    }

    markQuestion(questionId: string, isMarked: boolean): void {
        this.ensureInProgress();

        const existing = this.marks.find((m) => m.soalId === questionId);
        if (existing) {
            existing.isMarked = isMarked;
            return;
        }

        this.marks.push(
            new WorkSessionMarker(uuidv7(), this.id, questionId, isMarked),
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

export class WorkSessionJawaban {
    public id: string;
    public sesionId: string;
    public soalId: string;
    public jawabanId: string | null;
    public value: string | null;

    static create(
        sessionId: string,
        soalId: string,
        jawabanId: string | null,
        value: string | null,
    ) {
        const obj = new WorkSessionJawaban();

        obj.id = uuidv7();
        obj.sesionId = sessionId;
        obj.soalId = soalId;
        obj.jawabanId = jawabanId;
        obj.value = value;

        return obj;
    }

    map(data: Partial<WorkSessionJawaban>) {
        this.id = data.id ?? this.id;
        this.sesionId = data.sesionId ?? this.sesionId;
        this.soalId = data.soalId ?? this.soalId;
        this.jawabanId = data.jawabanId ?? this.jawabanId;
        this.value = data.value ?? this.value;
    }
}

export class WorkSessionMarker {
    constructor(
        public id: string,
        public sessionId: string,
        public soalId: string,
        public isMarked: boolean,
    ) { }
}
