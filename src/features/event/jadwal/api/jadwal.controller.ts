import { Controller, Get, Param, Query } from "@nestjs/common";
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session, } from '@thallesp/nestjs-better-auth'
import { JadwalService } from "../services/jadwal.service";
import { SiswaService } from "../../../siswa/services/siswa.service";

@Controller('jadwal')
export class JadwalController {
    constructor(
        private readonly service: JadwalService,
        private readonly siswaService: SiswaService
    ) { }

    @Get()
    async getAll(
        @Session() session: UserSession,
        @Query('siswaId') siswaId: string,
        @Query('agendaId') agendaId: string
    ) {
        const filterSiswa = session.user.role != 'admin' ?
            (await this.siswaService.findByAccount(session.user.id)).id :
            siswaId

        return this.service.listAll({
            siswaId: filterSiswa,
            agendaId: agendaId
        })
    }

    // private validateUser(req: Request): { userId: string, proktor: boolean } {
    //     if (!req.user)
    //         throw new AppException("User not specified")

    //     return req.user as { userId: string, proktor: boolean }
    // }

    // @Get(':id')
    // async getById(@Param('id') agendaId: string) {
    //     return await this.jadwalQuery.getById(agendaId)
    // }
}