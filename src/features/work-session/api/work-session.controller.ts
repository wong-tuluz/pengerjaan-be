import { Body, Controller, Post } from '@nestjs/common';
import { SubmitContract } from '../jobs/submit.contract';
import { RabbitMQService } from '../../../infra/rabbitmq/rabbitmq.service';
import { v7 as uuidv7 } from 'uuid';
import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const SubmitSchema = z.object({
    answerText: z.string().optional(),
});

class SubmitDto extends createZodDto(SubmitSchema) {}

@Controller('work-session')
export class WorkSessionController {
    constructor(private readonly rabbit: RabbitMQService) {}

    @Post('submit')
    async submitAction(@Body() body: SubmitDto) {
        const channel = await this.rabbit.createChannel();

        await channel.assertExchange('submit.exchange', 'direct', {
            durable: true,
        });

        const payload: SubmitContract = {
            id: uuidv7(),
            sessionId: uuidv7(),
            questionId: uuidv7(),
            answerId: uuidv7(),
            answerText: body.answerText || null,
            marked: false,
        };

        channel.publish(
            'submit.exchange',
            'submit',
            Buffer.from(JSON.stringify(payload)),
            {
                persistent: true,
                messageId: payload.id,
                headers: {
                    sessionId: payload.sessionId,
                },
            },
        );

        await channel.close();

        return { message: 'Submit job published' };
    }
}
