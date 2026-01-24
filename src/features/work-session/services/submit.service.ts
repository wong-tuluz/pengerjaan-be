import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../../../infra/rabbitmq/rabbitmq.service';
import { SubmitContract } from '../jobs/submit.contract';
import { v7 as uuidv7 } from 'uuid';
import { SubmitHandlerService } from './submit-handler.service';

@Injectable()
export class SubmitService {
    constructor(private readonly rabbit: RabbitMQService, private readonly handler: SubmitHandlerService) { }

    async publishSubmit(payload: SubmitContract) {
        this.handler.handle(payload)

        // const channel = await this.rabbit.createChannel();

        // try {
        //     await channel.assertExchange('submit.exchange', 'direct', {
        //         durable: true,
        //     });

        //     channel.publish(
        //         'submit.exchange',
        //         'submit',
        //         Buffer.from(JSON.stringify(payload)),
        //         {
        //             messageId: uuidv7(),
        //             persistent: true,
        //             headers: {
        //                 sessionId: payload.workSessionId,
        //             },
        //         },
        //     );
        // } finally {
        //     await channel.close();
        // }
    }
}
