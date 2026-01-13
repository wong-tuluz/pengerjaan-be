import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { SubmitContract } from '../jobs/submit.contract';
import { RabbitMQService } from '../../../infra/rabbitmq/rabbitmq.service';
import { SessionQueryService } from '../services/session-query.service';
import { SessionManagerService } from '../services/session-manager.service';
import z from 'zod';
import { v7 as uuidv7 } from 'uuid';
import { createZodDto } from 'nestjs-zod';
import { JwtAuthGuard } from '../../../features/auth/strategies/jwt.guard';
import { SessionStateQueryService } from '../services/session-state-query.service';

const CreateSessionSchema = z.object({
    siswaId: z.uuid(),
    jadwalId: z.uuid()
})

class CreateSessionDto extends createZodDto(CreateSessionSchema) { }

@Controller('work-session')
export class WorkSessionController {
    constructor(
        private readonly rabbit: RabbitMQService,
        private readonly sessionQuery: SessionQueryService,
        private readonly sessionManager: SessionManagerService,
        private readonly sessionStateQuery: SessionStateQueryService
    ) { }

    @Get()
    async getAllSessions(@Query('siswaId') siswaId, @Query('jadwalId') jadwalId) {
        return await this.sessionQuery.getSessions(siswaId, jadwalId)
    }

    @Get(':id')
    async getSession(@Param('id') id: string) {
        return await this.sessionQuery.getSessionById(id)
    }

    @Get(':id/state')
    async getSessionState(@Param('id') id: string) {
        return await this.sessionStateQuery.getSessionState(id)
    }

    @Post()
    async createSession(@Body() body: CreateSessionDto) {
        return await this.sessionManager.createSession(body.siswaId, body.jadwalId)
    }

    @Post(':id/submit')
    async submitAction(@Param('id') id: string, @Body() payload: SubmitContract) {
        //todo: shard tunnels

        const channel = await this.rabbit.createChannel();
        await channel.assertExchange('submit.exchange', 'direct', {
            durable: true,
        });

        channel.publish(
            'submit.exchange',
            'submit',
            Buffer.from(JSON.stringify(payload)),
            {
                messageId: uuidv7(),
                persistent: true,
                headers: {
                    sessionId: id,
                },
            },
        );

        await channel.close();

        return { message: 'Submit job published' };
    }
}
