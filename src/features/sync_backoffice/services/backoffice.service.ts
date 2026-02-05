import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Agenda } from "../types";

@Injectable()
export class BackofficeService {
    constructor(private readonly httpService: HttpService) { }

    static config = {
        url: process.env.LMS_BO_URL,
        key: process.env.LMS_BO_KEY,
        id: crypto.randomUUID(),
    }

    static tokenData = "";

    async generateToken(): Promise<{
        access_token: string,
        refresh_token: string,
        expire_in: string
    }> {
        const res = await firstValueFrom(
            await this.httpService.post(`${BackofficeService.config.url}/generate-token`, null, {
                headers: {
                    "x-nexus-lms-bo": BackofficeService.config.key,
                    "server-id": BackofficeService.config.id
                }
            })
        );

        BackofficeService.tokenData = res.data.access_token;
        return res.data;
    }


    async refreshToken(token: string): Promise<{
        access_token: string,
        refresh_token: string,
        expire_in: string
    }> {
        const res = await firstValueFrom(
            this.httpService.post(`${BackofficeService.config.url}/refresh-token`, null, {
                headers: {
                    "x-nexus-lms-bo": BackofficeService.config.key,
                    "server-id": BackofficeService.config.id,
                    "refresh_token": token
                }
            })
        );

        return res.data;
    }

    async listEvents(token: string): Promise<Omit<Agenda, 'jadwal'>[]> {
        const res = await firstValueFrom(
            this.httpService.get<Omit<Agenda, 'jadwal'>[]>(`${BackofficeService.config.url}/masterEvent`, {
                headers: {
                    "x-nexus-lms-bo": BackofficeService.config.key,
                    "server-id": BackofficeService.config.id,
                    "Authorization": `Bearer ${token}`
                }
            })
        );

        return res.data;
    }

    async fetchEventDetail(token: string, eventId: string): Promise<Agenda> {
        const res = await firstValueFrom(
            this.httpService.get<ApiData<Agenda>>(`${BackofficeService.config.url}/masterEventDetails/${eventId}`, {
                headers: {
                    "x-nexus-lms-bo": BackofficeService.config.key,
                    "server-id": BackofficeService.config.id,
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