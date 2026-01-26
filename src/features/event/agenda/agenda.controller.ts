import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AgendaService } from './agenda-command.service';
import { AgendaQueryService } from './agenda-query.service';

import { JwtAuthGuard } from '../../auth/strategies/jwt.guard';
import type { Request } from 'express';
import { AppException } from '../../../common/exceptions/application.exception';
import { CreateAgendaDto, UpdateAgendaDto } from './agenda.dto';

@Controller('agenda')
export class AgendaController {
    constructor(
        private readonly agendaService: AgendaService,
        private readonly agendaQuery: AgendaQueryService,
    ) {}

    @Post()
    async create(@Body() body: CreateAgendaDto) {
        return this.agendaService.create(body);
    }

    @Patch(':id')
    async updateAgenda(
        @Param('id') agendaId: string,
        @Body() body: UpdateAgendaDto,
    ) {
        await this.agendaService.updateAgenda(agendaId, body);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') agendaId: string) {
        await this.agendaService.delete(agendaId);
        return { success: true };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAll(@Req() req: Request) {
        const user = this.validateUser(req);

        if (user.proktor) {
            return this.agendaQuery.getAll();
        }
        return this.agendaQuery.getAll(user.userId);
    }

    @Get(':id')
    async getById(@Param('id') agendaId: string) {
        const agenda = await this.agendaQuery.getById(agendaId);

        if (!agenda) {
            throw new NotFoundException('Agenda not found');
        }

        return agenda;
    }

    @Get(':id/peserta')
    async getPeserta(@Param('id') agendaId: string) {
        const peserta = await this.agendaQuery.getPeserta(agendaId);

        return peserta;
    }

    private validateUser(req: Request): { userId: string; proktor: boolean } {
        if (!req.user) throw new AppException('User not specified');

        return req.user as { userId: string; proktor: boolean };
    }
}
