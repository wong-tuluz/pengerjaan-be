import { firstValueFrom } from "rxjs";
import { config, KEY, TokenStore } from ".";
import { SettingService } from "../../settings/settings.controller";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BackofficeSessionManager {
    constructor(
        private readonly httpService: HttpService,
        private readonly storage: SettingService
    ) { }

    async getAccessToken(): Promise<string> {
        const token = await this.storage.fetch<TokenStore>(KEY)

        if (!token) {
            const newToken = await this.generateToken()
            return newToken.access_token
        }

        const res = await firstValueFrom(
            await this.httpService.get(`${config.url}/cek`, {
                headers: {
                    "Authorization": `Bearer ${token?.access_token}`
                }
            })
        );

        if (res.status < 300) {
            const refreshedToken = await this.refreshToken()
            return refreshedToken.access_token
        }

        return token?.access_token!
    }

    private async generateToken(): Promise<{
        access_token: string,
        refresh_token: string,
        expire_in: string
    }> {
        const res = await firstValueFrom(
            await this.httpService.post(`${config.url}/generate-token`, null, {
                headers: {
                    "x-nexus-lms-bo": config.key,
                    "server-id": config.id
                }
            })
        );

        await this.storage.store<TokenStore>({
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token
        }, KEY);

        return res.data;
    }

    private async refreshToken(): Promise<{
        access_token: string,
        refresh_token: string,
        expire_in: string
    }> {
        const token = await this.storage.fetch<TokenStore>(KEY)

        const res = await firstValueFrom(
            this.httpService.post(`${config.url}/refresh-token`,
                {
                    refresh_token: token?.refresh_token
                },
                {
                    headers: {
                        "x-nexus-lms-bo": config.key,
                        "server-id": config.id
                    }
                }
            ));

        await this.storage.store<TokenStore>({
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token
        }, KEY);

        return res.data;
    }

}