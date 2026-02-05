import { Controller, Get, Param, Query } from "@nestjs/common";
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth'
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
        @Query('siswaId') siswaId?: string,
        @Query('agendaId') agendaId?: string,
    ) {
        const filterSiswa = session.user.role != 'admin' ?
            (await this.siswaService.findByAccount(session.user.id)).id :
            siswaId

        return this.service.listAll({
            siswaId: filterSiswa,
            agendaId: agendaId,
        })
    }

    @Get(':id')
    async getById(@Param('id') agendaId: string) {
        return await this.service.findById(agendaId)
    }
}