import { Controller, Get, Query } from "@nestjs/common";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { Session } from "@thallesp/nestjs-better-auth"
import { SiswaService } from "../siswa/siswa.service";
import { PengerjaanDetailService } from "./pengerjaan-detail.service";

@Controller('work-session-detail')
export class PengerjaanDetailController {
    constructor(
        private readonly service: PengerjaanDetailService,
        private readonly siswaService: SiswaService
    ) { }

    @Get()
    async listAll(
        @Session() session: UserSession,
        @Query('siswaId') siswaId?: string,
        @Query('jadwalId') jadwalId?: string,
        @Query('status') status?: string,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            siswaId = siswa.id
        }

        return await this.service.listAll({
            siswaId,
            jadwalId,
            status,
        });
    }
}
