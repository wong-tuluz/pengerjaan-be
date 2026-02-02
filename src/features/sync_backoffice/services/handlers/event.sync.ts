import { BackofficeService } from "../backoffice.service";

export class EventSyncHandler {
    constructor(
        private readonly syncService: BackofficeService,
    ) { }

    async handle(eventId: string, token: string){
        const event = await this.syncService.fetchEventDetail(token, eventId);

        
    }
}