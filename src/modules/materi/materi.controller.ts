import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import z from 'zod';
import { MateriService } from './materi.service';
import { createZodDto } from 'nestjs-zod';

export const CreateMateriSoalSchema = z.object({
    paketSoalId: z.string().uuid(),
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

export class CreateMateriSoalDto extends createZodDto(CreateMateriSoalSchema) { }

export class UpdateMateriSoalDto extends createZodDto(UpdateMateriSoalSchema) { }

@Controller('materi-soal')
export class MateriController {
    constructor(
        private readonly materiService: MateriService,
    ) { }

    @Post()
    async create(@Body() body: CreateMateriSoalDto) {
        return this.materiService.save(body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateMateriSoalDto) {
        const existing = await this.materiService.findById(id);
        await this.materiService.save({ ...existing, ...body });
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.materiService.delete(id);
        return { success: true };
    }

    @Get()
    async getAll(@Query('paketSoalId') paketSoalId: string) {
        return this.materiService.findByPaketSoalId(paketSoalId);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.materiService.findById(id);
    }
}
