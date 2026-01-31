import { v7 } from 'uuid'

export class SessionAnswer {
    id: string;
    workSessionId: string;
    soalId: string;
    jawabanSoalId: string | null;
    value: string | null;

    constructor(data: {
        id: string;
        workSessionId: string;
        soalId: string;
        jawabanSoalId: string | null;
        value: string | null;
    }) {
        this.id = data.id
        this.workSessionId = data.workSessionId
        this.soalId = data.soalId
        this.jawabanSoalId = data.jawabanSoalId
        this.value = data.value
    }

    static create(workSessionId: string, soalId: string, jawabanSoalId: string | null, value: string | null): SessionAnswer {
        return new SessionAnswer({
            id: v7(),
            workSessionId,
            soalId,
            jawabanSoalId,
            value
        })
    }
}