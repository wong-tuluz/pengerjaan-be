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
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { SoalService } from '../services/soal.service';
import { SoalQueryService } from '../services/soal-query.service';

export const SoalTypeSchema = z.enum([
    'multiple-choice',
    'essay',
    'complex-choice',
]);

export const JawabanInputSchema = z.object({
    value: z.string().min(1),
    isCorrect: z.boolean(),
    order: z.number().int().nonnegative(),
});

export const CreateSoalSchema = z
    .object({
        materiSoalId: z.uuid(),
        type: SoalTypeSchema,
        prompt: z.string().min(1),
        order: z.number().int().nonnegative(),
        weightCorrect: z.number(),
        weightWrong: z.number(),
        jawaban: z.array(JawabanInputSchema).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type === 'essay' && data.jawaban?.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Essay soal must not have jawaban',
                path: ['jawaban'],
            });
        }
    });

export const UpdateSoalSchema = z.object({
    prompt: z.string().min(1).optional(),
    order: z.number().int().nonnegative().optional(),
    weightCorrect: z.number().optional(),
    weightWrong: z.number().optional(),
    jawaban: z.array(JawabanInputSchema).optional(),
});

export class CreateSoalDto extends createZodDto(CreateSoalSchema) {}

export class UpdateSoalDto extends createZodDto(UpdateSoalSchema) {}

@Controller('soal')
export class SoalController {
    constructor(
        private readonly soalService: SoalService,
        private readonly soalQuery: SoalQueryService,
    ) {}

    @Post()
    async create(@Body() body: CreateSoalDto) {
        return this.soalService.create(body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateSoalDto) {
        await this.soalService.update(id, body);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.soalService.delete(id);
        return { success: true };
    }

    @Get()
    async getAll(@Query('materiSoalId') materiSoalId: string) {
        return this.soalQuery.getByMateriSoalId(materiSoalId);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        const soal = await this.soalQuery.getWithJawaban(id);

        if (!soal) {
            throw new NotFoundException('Soal not found');
        }

        return soal;
    }
}
