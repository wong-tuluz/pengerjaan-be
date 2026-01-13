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
import { SiswaQueryService } from '../services/siswa-query.service';
import { SiswaService } from '../services/siswa.service';
import z from 'zod';
import { createZodDto } from 'nestjs-zod';

import type { Response } from 'express';

const CreateSiswaSchema = z.object({
    nama: z.string().min(1),
    nis: z.string().min(1),
    kelas: z.string().min(1),
    username: z.string().min(3),
    passwordHash: z.string().min(1),
});

export const UpdateSiswaSchema = z.object({
    nama: z.string().min(1).optional(),
    nis: z.string().min(1).optional(),
    kelas: z.string().min(1).optional(),
    username: z.string().min(3).optional(),
    passwordHash: z.string().min(1).optional(),
});

export class CreateSiswaDto extends createZodDto(CreateSiswaSchema) { }

export class UpdateSiswaDto extends createZodDto(UpdateSiswaSchema) { }

@Controller('siswa')
export class SiswaController {
    constructor(
        private readonly siswaQuery: SiswaQueryService,
        private readonly siswaService: SiswaService,
    ) { }

    @Post()
    async create(@Body() body: CreateSiswaDto) {
        return this.siswaService.create(body);
    }

    @Patch(':id')
    async update(@Param('id') siswaId: string, @Body() body: UpdateSiswaDto) {
        await this.siswaService.update(siswaId, body);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') siswaId: string) {
        await this.siswaService.delete(siswaId);
        return { success: true };
    }

    @Get()
    async getAll(res: Response) {
        // res.locals.metadata = {
        //     hello: 'world'
        // }

        return this.siswaQuery.getAll();
    }

    @Get(':id')
    async getById(@Param('id') siswaId: string) {
        const siswa = await this.siswaQuery.getById(siswaId);

        if (!siswa) {
            throw new NotFoundException('Siswa not found');
        }

        return siswa;
    }
}
