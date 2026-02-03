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
        attempts: number;
        token: string;
    }) {
        this.id = data.id
        this.title = data.title
        this.agendaId = data.agendaId
        this.paketSoalId = data.paketSoalId
        this.startTime = data.startTime
        this.endTime = data.endTime
        this.attempts = data.attempts
        this.token = data.token
    }

    verifyToken(token: string) {
        if (this.token != token)
            throw new Error("Invalid token jadwal")
    }

    getTimeLimit(date: Date): number {
        const expiresAt = date.getTime() + this.timeLimit * 60 * 1000

        if (new Date(expiresAt) < this.endTime) {
            return expiresAt
        } else {
            return (this.endTime.getTime() - new Date().getTime()) / 60 / 100
        }
    }
}
