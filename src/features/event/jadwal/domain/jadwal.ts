export class Jadwal {
    id: string;
    title: string;
    agendaId: string;
    paketSoalId: string;
    startTime: Date;
    endTime: Date;
    timeLimit: number;
    attempts: number;
    token: string;

    constructor(data: {
        id: string;
        title: string;
        agendaId: string;
        paketSoalId: string;
        startTime: Date;
        endTime: Date;
        timeLimit: number;
        attempts: number;
        token: string;
    }) {
        this.id = data.id
        this.title = data.title
        this.agendaId = data.agendaId
        this.paketSoalId = data.paketSoalId
        this.startTime = data.startTime
        this.endTime = data.endTime
        this.timeLimit = data.timeLimit
        this.attempts = data.attempts
        this.token = data.token
    }

    static create(data: {
        title: string;
        agendaId: string;
        paketSoalId: string;
        startTime: Date;
        endTime: Date;
        timeLimit: number;
        attempts: number;
        token: string;
    }) {
        return new Jadwal({ id: crypto.randomUUID(), ...data })
    }

    verifyToken(token: string) {
        if (this.token != token)
            throw new Error("Invalid token jadwal")
    }

    getTimeLimit(date: Date): number {
        const expiresAt = date.getTime() + this.timeLimit * 60 * 1000

        let res = 0
        if (new Date(expiresAt) < this.endTime) {
            res = (expiresAt - new Date().getTime()) / 1000 / 60
        } else {
            res = (this.endTime.getTime() - new Date().getTime()) / 1000 / 60
        }

        return res
    }
}
