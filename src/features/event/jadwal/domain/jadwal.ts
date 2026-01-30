export class Jadwal {
    id: string;
    agendaId: string;
    paketSoalId: string;
    startTime: Date;
    endTime: Date;
    timeLimit: number;
    attempts: number;
    token: string;

    constructor(data: {
        id: string;
        agendaId: string;
        paketSoalId: string;
        startTime: Date;
        endTime: Date;
        attempts: number;
        token: string;
    }) {
        this.id = data.id
        this.agendaId = data.agendaId
        this.paketSoalId = data.paketSoalId
        this.startTime = data.startTime
        this.endTime = data.endTime
        this.attempts = data.attempts
        this.token = data.token
    }
}
