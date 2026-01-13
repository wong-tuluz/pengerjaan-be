import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { AgendaService } from '../services/agenda.service';
import { AgendaQueryService } from '../services/agenda-query.service';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const ApiDate = z.iso.date().transform((v) => new Date(v));
const ApiDateTime = z.iso.datetime().transform((v) => new Date(v));

const JadwalInputSchema = z.object({
    paketSoalId: z.uuid(),
    startTime: ApiDateTime,
    endTime: ApiDateTime,
});

const UpdateAgendaSchema = z.object({
    title: z.string().min(1).optional(),
    startTime: ApiDateTime,
    endTime: ApiDateTime,
    description: z.string().nullable().optional(),
    jadwal: z.array(JadwalInputSchema).nullable().optional(),
});

const CreateAgendaSchema = z.object({
    title: z.string().min(1),
    startTime: ApiDateTime,
    endTime: ApiDateTime,
    description: z.string().nullable().optional(),
    jadwal: z.array(JadwalInputSchema).optional(),
});

export class CreateAgendaDto extends createZodDto(CreateAgendaSchema) { }

export class UpdateAgendaDto extends createZodDto(UpdateAgendaSchema) { }

@Controller('agenda')
export class AgendaController {
    constructor(
        private readonly agendaService: AgendaService,
        private readonly agendaQuery: AgendaQueryService,
    ) { }

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
    async getAll(@Query('siswaId') siswaId?: string) {
        return this.agendaQuery.getAll(siswaId);
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
        const peserta = await this.agendaQuery.getPeserta(agendaId)

        return peserta
    }
}
