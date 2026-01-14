import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SubmitContract } from '../jobs/submit.contract';
import { RabbitMQService } from '../../../infra/rabbitmq/rabbitmq.service';
import { SessionQueryService } from '../services/session-query.service';
import { SessionManagerService } from '../services/session-manager.service';
import z from 'zod';
import { v7 as uuidv7 } from 'uuid';
import { createZodDto } from 'nestjs-zod';
import { SessionStateQueryService } from '../services/session-state-query.service';
import { JwtAuthGuard } from '../../auth/strategies/jwt.guard';
import type { Request } from 'express';
import { AppException } from '../../../infra/exceptions/app-exception';
import { jawabanSoalTable } from '../../../infra/drizzle/schema';

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
        private readonly rabbit: RabbitMQService,
        private readonly sessionQuery: SessionQueryService,
        private readonly sessionManager: SessionManagerService,
        private readonly sessionStateQuery: SessionStateQueryService
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

        const channel = await this.rabbit.createChannel();
        await channel.assertExchange('submit.exchange', 'direct', {
            durable: true,
        });

        const payload: SubmitContract = {
            workSessionId: sessionId,
            soalId: body.soalId,
            jawaban: body.jawaban
        }

        channel.publish(
            'submit.exchange',
            sessionId,
            Buffer.from(JSON.stringify(payload)),
            {
                messageId: uuidv7(),
                persistent: true,
                headers: {
                    sessionId: sessionId,
                },
            },
        );

        await channel.close();

        return { message: 'Submit job published' };
    }

    private validateUser(req: Request): { userId: string, proktor: boolean } {
        if (!req.user)
            throw new AppException("User not specified")

        return req.user
    }
}
