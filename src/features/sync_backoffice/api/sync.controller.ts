import { Controller, Get, Param, Post } from "@nestjs/common";
import { BackofficeService } from "../services/backoffice.service";
import { EventSyncHandler } from "../services/handlers/event.sync";

@Controller('sync')
export class SyncController {
    constructor(
        private readonly service: BackofficeService,
        private readonly handler: EventSyncHandler,
    ) { }

    @Get('events')
    async listEvents() {
        return this.service.listEvents();
    }

    @Post('events/:eventId/sync')
    async syncEvent(@Param('eventId') eventId: string) {
        await this.handler.handle(eventId);
    }
}