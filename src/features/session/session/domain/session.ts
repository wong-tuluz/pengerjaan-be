import { v7 } from "uuid";

export type SessionStatus = 'in_progress' | 'finished';

export class Session {
    id: string;
    siswaId: string;
    jadwalId: string;
    paketSoalId: string;
    materiSoalId?: string | null;
    timeLimit: number;
    startedAt: Date;
    finishedAt?: Date | null;
    status: SessionStatus;

    constructor(data: {
        id: string;
        siswaId: string;
        jadwalId: string;
        paketSoalId: string;
        materiSoalId?: string | null;
        timeLimit: number;
        startedAt: Date;
        finishedAt?: Date | null;
        status: SessionStatus;
    }) {
        this.id = data.id
        this.siswaId = data.siswaId
        this.jadwalId = data.jadwalId
        this.paketSoalId = data.paketSoalId
        this.materiSoalId = data.materiSoalId
        this.timeLimit = data.timeLimit
        this.startedAt = data.startedAt
        this.finishedAt = data.finishedAt
        this.status = data.status
    }

    static create(siswaId: string, jadwalId: string, paketSoalId: string, materiSoalId: string | null, timeLimit: number): Session {
        return new Session({
            id: v7(),
            siswaId,
            jadwalId,
            paketSoalId,
            materiSoalId,
            timeLimit,
            status: 'in_progress',
            startedAt: new Date(),
            finishedAt: null
        })
    }

    isExpired() {
        if (!this.timeLimit) return false;

        const expiresAt = this.startedAt.getTime() + this.timeLimit * 60 * 1000
        return new Date() > new Date(expiresAt);
    }

    finish() {
        this.finishedAt = new Date()
        this.status = 'finished'
    }

        async reset(sessionId: string) {
            const session = await this.findById(sessionId);
    
            session.reset()
            await this.upsert(session)
        }

    reset() {
        this.status = 'in_progress'
    }
}

