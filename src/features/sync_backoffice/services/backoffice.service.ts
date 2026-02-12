import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Agenda } from "../types";
import { config } from ".";
import { BackofficeSessionManager } from "./manager.service";

@Injectable()
export class BackofficeService {
    constructor(
        private readonly httpService: HttpService,
        private readonly manager: BackofficeSessionManager
    ) { }

    async listEvents(): Promise<Omit<Agenda, 'jadwal'>[]> {
        const token = await this.manager.getAccessToken()
        
        const res = await firstValueFrom(
            this.httpService.get<Omit<Agenda, 'jadwal'>[]>(`${config.url}/masterEvent`, {
                headers: {
                    "x-nexus-lms-bo": config.key,
                    "server-id": config.id,
                    "Authorization": `Bearer ${token}`
                }
            })
        );

        return res.data;
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
