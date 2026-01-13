import { Body, Controller, Post } from '@nestjs/common';
import { SubmitContract } from '../jobs/submit.contract';
import { RabbitMQService } from '../../../infra/rabbitmq/rabbitmq.service';

@Controller('work-session')
export class WorkSessionController {
    constructor(private readonly rabbit: RabbitMQService) { }

    @Post('submit')
    async submitAction(@Body() payload: SubmitContract) {
        const channel = await this.rabbit.createChannel();

        await channel.assertExchange('submit.exchange', 'direct', {
            durable: true,
        });

        channel.publish(
            'submit.exchange',
            'submit',
            Buffer.from(JSON.stringify(payload)),
            {
                persistent: true,
                messageId: payload.id,
                headers: {
                    sessionId: payload.workSessionId,
                },
            },
        );

        await channel.close();

        return { message: 'Submit job published' };
    }
}
