import { Get, Query, Post, Body, Param, UnauthorizedException, Controller } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth'
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { SiswaService } from '../siswa/siswa.service';
import { PengerjaanService } from './pengerjaan.service';
import type { SessionStatus } from './pengerjaan.service';

const CreatePengerjaanSchema = z.object({
    jadwalId: z.string(),
    token: z.string()
});
export class CreatePengerjaanDto extends createZodDto(CreatePengerjaanSchema) { }

@Controller('work-session')
export class PengerjaanController {
    constructor(
        private readonly siswaService: SiswaService,
        private readonly pengerjaanService: PengerjaanService
    ) { }

    @Get()
    async listAll(
        @Session() session: UserSession,
        @Query('siswaId') siswaId?: string,
        @Query('jadwalId') jadwalId?: string,
        @Query('status') status?: SessionStatus,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            siswaId = siswa.id
        }

        return await this.pengerjaanService.listAll({
            siswaId,
            jadwalId,
            status,
        });
    }

    @Get(':id')
    async findById(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
        }

        return await this.pengerjaanService.findById(sessionId);
    }

    @Post(':id/finish')
    async finish(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
        }

        return await this.pengerjaanService.finish(sessionId);
    }

    @Post(':id/reset')
    async reset(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            throw new UnauthorizedException();
        }

        return await this.pengerjaanService.reset(sessionId);
    }

    @Post(':id/warn')
    async warn(
        @Param('id') sessionId: string
    ) {
        return await this.pengerjaanService.warn(sessionId);
    }

    @Post(':id/unwarn')
    async unwarn(
        @Param('id') sessionId: string
    ) {
        return await this.pengerjaanService.unwarn(sessionId);
    }

    @Post()
    async create(
        @Session() session: UserSession,
        @Body() body: CreatePengerjaanDto
    ) {
        if (session.user.role == 'admin') {
            throw new UnauthorizedException();
        }

        const siswa = await this.siswaService.findByAccount(session.user.id)
        return await this.pengerjaanService.create(
            siswa.id,
            body.jadwalId,
            body.token
        );
    }
}
