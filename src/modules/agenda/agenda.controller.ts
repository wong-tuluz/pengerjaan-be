import {
    Controller,
    Get,
    Param,
    Query,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session, } from '@thallesp/nestjs-better-auth'
import { SiswaService } from '../siswa/siswa.service';

@Controller('agenda')
export class AgendaController {
    constructor(
        private readonly service: AgendaService,
        private readonly siswaService: SiswaService
    ) { }

    @Get()
    async get(
        @Session() session: UserSession,
        @Query("siswaId") siswaId?: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            return await this.service.listAll({ siswaId: siswa.id })
        } else {
            return await this.service.listAll({ siswaId })
        }
    }

    @Get(':id')
    async findById(
        @Session() session: UserSession,
        @Param('id') agendaId: string,
    ) {
        return await this.service.findById(agendaId)
    }

    @Get(':id/peserta')
    async listPeserta(
        @Session() session: UserSession,
        @Param('id') agendaId: string,
    ) {
        return await this.service.listSiswa(agendaId)
    }
}