import { Controller, Get, Param, Query } from "@nestjs/common";
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth'
import { JadwalService } from "./jadwal.service";
import { SiswaService } from "../siswa/siswa.service";

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
        const isPrivileged = session.user.role === 'admin' || session.user.role === 'proktor';
        const filterSiswa = isPrivileged ?
            siswaId :
            (await this.siswaService.findByAccount(session.user.id)).id

        return this.service.listAll({
            siswaId: filterSiswa,
            agendaId: agendaId,
        })
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return await this.service.findById(id)
    }
}
