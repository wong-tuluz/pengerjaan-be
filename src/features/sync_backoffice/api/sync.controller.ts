import { Controller, Get, Param, Post } from "@nestjs/common";
import { BackofficeService } from "../services/backoffice.service";
import { EventSyncHandler } from "../services/handlers/event.sync";

@Controller('sync')
export class SyncController {
    constructor(
        private readonly syncService: BackofficeService,
        private readonly handler: EventSyncHandler,
    ) { }

    @Get('events')
    async listEvents() {
        await this.syncService.generateToken();
        return this.syncService.listEvents(BackofficeService.tokenData);
    }

    @Post('events/:eventId/sync')
    async syncEvent(@Param('eventId') eventId: string) {
        await this.syncService.generateToken();
        await this.handler.handle(eventId, BackofficeService.tokenData);
    }
}