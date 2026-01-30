export class Agenda {
    id: string;
    title: string;
    description: string;

    // this did not enforce anything (visual only)
    startTime: Date;
    endTime: Date;

    constructor(data: {
        id: string;
        title: string;
        description: string;
        startTime: Date;
        endTime: Date;
    }) {
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.startTime = data.startTime
        this.endTime = data.endTime
    }
}