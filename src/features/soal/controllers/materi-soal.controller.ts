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
import z from 'zod';
import { MateriSoalQueryService } from '../services/materi-soal-query.service';
import { MateriSoalService } from '../services/materi-soal.service';
import { createZodDto } from 'nestjs-zod';

export const CreateMateriSoalSchema = z.object({
    paketSoalId: z.uuid(),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    order: z.number().int().nonnegative(),
    timeLimit: z.number().int().positive(),
});

export const UpdateMateriSoalSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    order: z.number().int().nonnegative().optional(),
    timeLimit: z.number().int().positive().optional(),
});

export class CreateMateriSoalDto extends createZodDto(CreateMateriSoalSchema) {}

export class UpdateMateriSoalDto extends createZodDto(UpdateMateriSoalSchema) {}

@Controller('materi-soal')
export class MateriSoalController {
    constructor(
        private readonly materiSoalService: MateriSoalService,
        private readonly materiSoalQuery: MateriSoalQueryService,
    ) {}

    @Post()
    async create(@Body() body: CreateMateriSoalDto) {
        return this.materiSoalService.create(body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateMateriSoalDto) {
        await this.materiSoalService.update(id, body);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.materiSoalService.delete(id);
        return { success: true };
    }

    @Get()
    async getAll(@Query('paketSoalId') paketSoalId: string) {
        return this.materiSoalQuery.getByPaketSoalId(paketSoalId);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        const materiSoal = await this.materiSoalQuery.getById(id);
        if (!materiSoal) {
            throw new NotFoundException('Materi soal not found');
        }
        return materiSoal;
    }
}
