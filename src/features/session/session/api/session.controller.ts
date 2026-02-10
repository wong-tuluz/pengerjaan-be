import { Get, Query, Req, Post, Body, Param, UnauthorizedException, NotFoundException, Controller } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth'
import { SiswaService } from '../../../siswa/services/siswa.service';
import { SessionService } from '../services/session.service';
import { CreateSessionDto } from './session.dto';

@Controller('work-session')
export class SessionController {
    constructor(
        private readonly siwaService: SiswaService,
        private readonly sessionService: SessionService
    ) { }


    @Get()
    async listAll(
        @Session() session: UserSession,
        @Query('siswaId') siswaId?,
        @Query('jadwalId') jadwalId?,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siwaService.findByAccount(session.user.id)
            siswaId = siswa.id
        }

        return await this.sessionService.listAll({
            siswaId,
            jadwalId,
        });
    }

    @Get(':id')
    async findById(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siwaService.findByAccount(session.user.id)
            await this.sessionService.hasAccess(sessionId, siswa.id)
        }

        return await this.sessionService.findById(sessionId);
    }

    @Post(':id/finish')
    async finish(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siwaService.findByAccount(session.user.id)
            await this.sessionService.hasAccess(sessionId, siswa.id)
        }

        return await this.sessionService.finish(sessionId);
    }

    @Post(':id/reset')
    async reset(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            throw new UnauthorizedException();
        }

        return await this.sessionService.reset(sessionId);
    }

    @Post()
    async create(
        @Session() session: UserSession,
        @Body() body: CreateSessionDto
    ) {
        if (session.user.role == 'admin') {
            throw new UnauthorizedException();
        }

        const siswa = await this.siwaService.findByAccount(session.user.id)
        return await this.sessionService.create(
            siswa.id,
            body.jadwalId,
            body.token
        );
    }
}