import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Agenda } from "../types";

@Injectable()
export class BackofficeService {
    constructor(private readonly httpService: HttpService) { }

    private config = {
        url: process.env.LMS_BO_URL,
        key: process.env.LMS_BO_KEY,
        id: process.env.LMS_BO_ID
    }

    async generateToken(): Promise<{
        access_token: string,
        refresh_token: string,
        expire_in: string
    }> {
        const res = await firstValueFrom(
            this.httpService.get(`${this.config.url}/generate-token`, {
                headers: {
                    "x-nexus-lms-bo": this.config.key,
                    "server-id": this.config.id
                }
            })
        );

        return res.data;
    }


    async refreshToken(token: string): Promise<{
        access_token: string,
        refresh_token: string,
        expire_in: string
    }> {
        const res = await firstValueFrom(
            this.httpService.get(`${this.config.url}/refresh-token`, {
                headers: {
                    "x-nexus-lms-bo": this.config.key,
                    "server-id": this.config.id,
                    "refresh_token": token
                }
            })
        );

        return res.data;
    }

    async listEvents(token: string): Promise<Omit<Agenda, 'jadwal'>[]> {
        const res = await firstValueFrom(
            this.httpService.get<Omit<Agenda, 'jadwal'>[]>(`${this.config.url}/masterEvent`, {
                headers: {
                    "x-nexus-lms-bo": this.config.key,
                    "server-id": this.config.id,
                    "Authorization": `Bearer ${token}`
                }
            })
        );

        return res.data;
    }

    async fetchEventDetail(token: string, eventId: string): Promise<Agenda> {
        const res = await firstValueFrom(
            this.httpService.get<Agenda>(`${this.config.url}/masterEvent/${eventId}`, {
                headers: {
                    "x-nexus-lms-bo": this.config.key,
                    "server-id": this.config.id,
                    Authorization: `Bearer ${token}`,
                },
            })
        );

        return res.data;
    }
}
