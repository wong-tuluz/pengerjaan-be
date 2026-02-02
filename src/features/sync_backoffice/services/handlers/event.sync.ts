import { BackofficeService } from "../backoffice.service";

export class EventSyncHandler {
    constructor(
        private readonly syncService: BackofficeService,
    ) { }

    async handle(eventId: string, token: string): Promise<Event> {
        const eventDetail$ = this.syncService.fetchEventDetail(token, eventId);

        // const eventDetail = await firstValueFrom(eventDetail$).then(res => res.data);

        // return eventDetail;
        return {} as Event;
    }
}