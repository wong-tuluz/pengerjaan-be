import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SessionQueryService } from '../services/session-query.service';
import { SessionManagerService } from '../services/session-manager.service';
import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { SessionStateQueryService } from '../services/session-state-query.service';
import { JwtAuthGuard } from '../../auth/strategies/jwt.guard';
import type { Request } from 'express';
import { AppException } from '../../../infra/exceptions/app-exception';
import { SubmitService } from '../services/submit.service';

const CreateSessionSchema = z.object({
    jadwalId: z.uuid()
})

const SessionActionSchema = z.object({
    soalId: z.uuid(),
    marked: z.boolean().optional(),
    jawaban: z.array(z.object({
        jawabanSoalId: z.uuid().nullable(),
        value: z.string().nullable()
    }))
})

class CreateSessionDto extends createZodDto(CreateSessionSchema) { }

class SessionActionDto extends createZodDto(SessionActionSchema) { }

@Controller('work-session')
export class WorkSessionController {
    constructor(
        private readonly sessionQuery: SessionQueryService,
        private readonly sessionManager: SessionManagerService,
        private readonly sessionStateQuery: SessionStateQueryService,
        private readonly submitService: SubmitService,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllSessions(@Req() req: Request, @Query('siswaId') siswaId?, @Query('jadwalId') jadwalId?) {
        const user = this.validateUser(req)
        return await this.sessionQuery.getSessions(user.proktor ? siswaId : user.userId, jadwalId)
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getSession(@Req() req: Request, @Param('id') sessionId: string) {
        const user = this.validateUser(req)
        return await this.sessionQuery.getSessionById(sessionId, !user.proktor ? user.userId : undefined)
    }

    @Get(':id/state')
    @UseGuards(JwtAuthGuard)
    async getSessionState(@Req() req: Request, @Param('id') sessionId: string) {
        const user = this.validateUser(req)

        return await this.sessionStateQuery.getSessionState(sessionId, !user.proktor ? user.userId : undefined)
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createSession(@Req() req: Request, @Body() body: CreateSessionDto) {
        const user = this.validateUser(req)
        if (user.proktor) {
            throw new UnauthorizedException()
        }


        return await this.sessionManager.createSession(req.user!.userId, body.jadwalId)
    }

    @Post(':id/submit')
    @UseGuards(JwtAuthGuard)
    async submitAction(@Req() req: Request, @Param('id') sessionId: string, @Body() body: SessionActionDto) {
        const user = this.validateUser(req)
        const session = await this.sessionQuery.getSessionById(sessionId, !user.proktor ? user.userId : undefined)

        if (!session) {
            throw new NotFoundException("Session not found.")
        }

        await this.submitService.publishSubmit({
            workSessionId: sessionId,
            soalId: body.soalId,
            jawaban: body.jawaban
        });

        return { message: 'Submit job published' };
    }

    private validateUser(req: Request): { userId: string, proktor: boolean } {
        if (!req.user)
            throw new AppException("User not specified")

        return req.user as { userId: string, proktor: boolean }
    }
}
