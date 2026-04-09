import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { PaketSoalService } from './paket-soal.service';

export const CreatePaketSoalSchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
});

export const UpdatePaketSoalSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
});

export class CreatePaketSoalDto extends createZodDto(CreatePaketSoalSchema) { }

export class UpdatePaketSoalDto extends createZodDto(UpdatePaketSoalSchema) { }

@Controller('paket-soal')
export class PaketSoalController {
    constructor(
        private readonly paketSoalService: PaketSoalService,
    ) { }

    @Post()
    async create(@Body() body: CreatePaketSoalDto) {
        return this.paketSoalService.save(body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdatePaketSoalDto) {
        const existing = await this.paketSoalService.findById(id);
        await this.paketSoalService.save({ ...existing, ...body });
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.paketSoalService.delete(id);
        return { success: true };
    }

    @Get()
    async getAll() {
        return this.paketSoalService.findAll();
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.paketSoalService.findById(id);
    }

    @Get(':id/question-count')
    async getQuestionCount(@Param('id') id: string) {
        const count = await this.paketSoalService.getQuestionCount(id);
        return { count };
    }
}
