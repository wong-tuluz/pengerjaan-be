export class Agenda {
    public id: string;
    public title: string;
    public date: Date;
    public description: string;
}

export class Jadwal {
    public id: string;
    public agendaId: string;
    public paketSoalId: string;
    public startTime: Date;
    public endTime: Date;
}
