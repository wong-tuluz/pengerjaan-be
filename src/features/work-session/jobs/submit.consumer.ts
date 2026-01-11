import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQService } from '../../../infra/rabbitmq/rabbitmq.service';
import { SubmitHandlerService } from '../services/submit-handler.service';

@Injectable()
export class SubmitConsumer implements OnModuleInit {
    private channel!: Channel;

    constructor(
        private readonly rabbit: RabbitMQService,
        private readonly handler: SubmitHandlerService,
    ) {}

    async onModuleInit() {
        this.channel = await this.rabbit.createChannel();
        await this.setupTopology();
        await this.startConsuming();
    }

    private async setupTopology() {
        await this.channel.assertExchange('submit.exchange', 'direct', {
            durable: true,
        });

        const { queue } = await this.channel.assertQueue('submit.queue', {
            durable: true,
        });

        await this.channel.bindQueue(queue, 'submit.exchange', 'submit');
        await this.channel.prefetch(1);
    }

    private async startConsuming() {
        await this.channel.consume(
            'submit.queue',
            (msg) => this.handleMessage(msg),
            { noAck: false },
        );
    }

    private onCompleted(jobId?: string) {
        console.log(`Job ${jobId} completed`);
    }

    private onFailed(jobId?: string, error?: Error) {
        console.error(`Job ${jobId} failed: ${error?.message}`);
    }

    private async handleMessage(msg: ConsumeMessage | null) {
        if (!msg) return;

        const jobId = msg.properties.messageId;
        const job = JSON.parse(msg.content.toString());

        try {
            await this.handler.handle(job);
            this.channel.ack(msg);
            this.onCompleted(jobId);
        } catch (err) {
            this.channel.nack(msg, false, true);
            this.onFailed(jobId, err as Error);
        }
    }
}
