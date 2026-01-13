export class Agenda {
    public id: string;
    public title: string;
    public description: string;
    public startTime: Date;
    public endTime: Date;
}

export class Jadwal {
    public id: string;
    public agendaId: string;
    public paketSoalId: string;
    public startTime: Date;
    public endTime: Date;
}
