import { Controller, Get, Query, Session } from "@nestjs/common";
import { SessionDetailService } from "./session-query.service";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { SiswaService } from "../../siswa/services/siswa.service";

@Controller('work-session-detail')
export class SessionDetailController {
    constructor(
        private readonly service: SessionDetailService,
        private readonly siwaService: SiswaService
    ) { }

    @Get()
    async listAll(
        @Session() session: UserSession,
        @Query('siswaId') siswaId?,
        @Query('jadwalId') jadwalId?,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siwaService.findByAccount(session.user.id)
            siswaId = siswa.id
        }

        return await this.service.listAll({
            siswaId,
            jadwalId,
        });
    }
}