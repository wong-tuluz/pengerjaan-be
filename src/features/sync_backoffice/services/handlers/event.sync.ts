import { AgendaService } from "../../../event/agenda/service/agenda.service";
import { JadwalService } from "../../../event/jadwal/services/jadwal.service";
import { BackofficeService } from "../backoffice.service";

export class EventSyncHandler {
    constructor(
        private readonly syncService: BackofficeService,
        private readonly agendaService: AgendaService,
        private readonly jadwalService: JadwalService,
    ) { }

    async handle(eventId: string, token: string){
        const event = await this.syncService.fetchEventDetail(token, eventId);

        

    }
}