import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { PaketSoalQueryService } from '../services/paket-soal-query.service';
import { PaketSoalService } from '../services/paket-soal.service';
import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreatePaketSoalSchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    timeLimit: z.number().int().positive(),
});

export const UpdatePaketSoalSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    timeLimit: z.number().int().positive().optional(),
});

export class CreatePaketSoalDto extends createZodDto(CreatePaketSoalSchema) {}

export class UpdatePaketSoalDto extends createZodDto(UpdatePaketSoalSchema) {}

@Controller('paket-soal')
export class PaketSoalController {
    constructor(
        private readonly paketSoalService: PaketSoalService,
        private readonly paketSoalQuery: PaketSoalQueryService,
    ) {}

    @Post()
    async create(
        @Body()
        body: CreatePaketSoalDto,
    ) {
        return this.paketSoalService.create(body);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body()
        body: UpdatePaketSoalDto,
    ) {
        await this.paketSoalService.update(id, body);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.paketSoalService.delete(id);
        return { success: true };
    }

    @Get()
    async getAll() {
        return this.paketSoalQuery.getAll();
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        const paketSoal = await this.paketSoalQuery.getById(id);

        if (!paketSoal) {
            throw new NotFoundException('Paket soal not found');
        }

        return paketSoal;
    }
}
