import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Agenda } from "../types";
import { config } from ".";
import { BackofficeSessionManager } from "./manager.service";
import { SettingService } from "../../settings/settings.controller";

const SYNC_KEY = "event_sync"

@Injectable()
export class BackofficeService {
    constructor(
        private readonly httpService: HttpService,
        private readonly manager: BackofficeSessionManager,
        private readonly storage: SettingService
    ) { }

    async listEvents(): Promise<(Omit<Agenda, 'jadwal'> & { synced: boolean })[]> {
        const token = await this.manager.getAccessToken()

        const syncedEvent = await this.storage.fetch<string[]>(SYNC_KEY) || []

        const res = await firstValueFrom(
            this.httpService.get<ApiData<Omit<Agenda, 'jadwal'>[]>>(`${config.url}/masterEvent`, {
                headers: {
                    "x-nexus-lms-bo": config.key,
                    "server-id": config.id,
                    "Authorization": `Bearer ${token}`
                }
            })
        );

        const result = res.data.data.map(x => ({ ...x , synced: syncedEvent.includes(x.id)}))

        return result;
    }

    async fetchEventDetail(eventId: string): Promise<Agenda> {
        const token = await this.manager.getAccessToken()

        const res = await firstValueFrom(
            this.httpService.get<ApiData<Agenda>>(`${config.url}/masterEventDetails/${eventId}`, {
                headers: {
                    "x-nexus-lms-bo": config.key,
                    "server-id": config.id,
                    Authorization: `Bearer ${token}`,
                },
            })
        );

        return res.data.data;
    }
}

interface ApiData<T> {
    success: boolean,
    message: string,
    data: T
}
