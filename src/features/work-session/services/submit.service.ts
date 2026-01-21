import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../../../infra/rabbitmq/rabbitmq.service';
import { SubmitContract } from '../jobs/submit.contract';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class SubmitService {
    constructor(private readonly rabbit: RabbitMQService) { }

    async publishSubmit(payload: SubmitContract) {
        const channel = await this.rabbit.createChannel();

        try {
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
                        sessionId: payload.workSessionId,
                    },
                },
            );
        } finally {
            await channel.close();
        }
    }
}
