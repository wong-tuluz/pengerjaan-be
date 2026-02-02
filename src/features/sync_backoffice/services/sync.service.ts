import { Injectable } from "@nestjs/common";
import { BackofficeService } from "./backoffice.service";


@Injectable()
export class SyncService {
    constructor(
        private readonly backoffice: BackofficeService,
    ) { }


}