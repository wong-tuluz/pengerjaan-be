import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { Observable } from "rxjs";

@Injectable()
export class SyncService {
    constructor(private readonly httpService: HttpService) { }

    private config = {
        url: process.env.LMS_BO_URL,
        key: process.env.LMS_BO_KEY,
        id: process.env.LMS_BO_ID
    }

    generateToken(): Observable<AxiosResponse<{
        access_token: string,
        refresh_token: string,
        expire_in: string
    }>> {
        const res = this.httpService.get(`${this.config.url}/generate-token`, {
            headers: {
                "x-nexus-lms-bo": this.config.key,
                "server-id": this.config.id
            }
        });

        return res
    }

    
    refreshToken(token: string): Observable<AxiosResponse<{
        access_token: string,
        refresh_token: string,
        expire_in: string
    }>> {
        const res = this.httpService.get(`${this.config.url}/refresh-token`, {
            headers: {
                "x-nexus-lms-bo": this.config.key,
                "server-id": this.config.id,
                "refresh_token": token
            }
        });

        return res
    }
}
