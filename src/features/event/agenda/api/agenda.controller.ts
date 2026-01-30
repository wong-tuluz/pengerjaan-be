import {
    Controller,
    Get,
    Param,
    Query,
    UnauthorizedException,
} from '@nestjs/common';
import { AgendaService } from '../service/agenda.service';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session, } from '@thallesp/nestjs-better-auth'
import { SiswaService } from '../../../siswa/services/siswa.service';

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

    // @Post()
    // async create(@Body() body: CreateAgendaDto) {
    //     return this.agendaService.create(body);
    // }

    // @Patch(':id')
    // async updateAgenda(
    //     @Param('id') agendaId: string,
    //     @Body() body: UpdateAgendaDto,
    // ) {
    //     await this.agendaService.updateAgenda(agendaId, body);
    //     return { success: true };
    // }

    // @Delete(':id')
    // async delete(@Param('id') agendaId: string) {
    //     await this.agendaService.delete(agendaId);
    //     return { success: true };
    // }

    // @Get()
    // @UseGuards(JwtAuthGuard)
    // async getAll(@Req() req: Request) {
    //     const user = this.validateUser(req);

    //     if (user.proktor) {
    //         return this.agendaQuery.getAll();
    //     }
    //     return this.agendaQuery.getAll(user.userId);
    // }

    // @Get(':id')
    // async getById(@Param('id') agendaId: string) {
    //     const agenda = await this.agendaQuery.getById(agendaId);

    //     if (!agenda) {
    //         throw new NotFoundException('Agenda not found');
    //     }

    //     return agenda;
    // }

    // @Get(':id/peserta')
    // async getPeserta(@Param('id') agendaId: string) {
    //     const peserta = await this.agendaQuery.getPeserta(agendaId);

    //     return peserta;
    // }

    // private validateUser(req: Request): { userId: string; proktor: boolean } {
    //     if (!req.user) throw new AppException('User not specified');

    //     return req.user as { userId: string; proktor: boolean };
    // }
}
