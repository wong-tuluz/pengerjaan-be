import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQService } from '../../../infra/rabbitmq/rabbitmq.service';
import { SubmitHandlerService } from '../services/submit-handler.service';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

@Injectable()
export class SubmitConsumer implements OnModuleInit {
    private channel!: Channel;

    constructor(
        private readonly rabbit: RabbitMQService,
        private readonly handler: SubmitHandlerService,
    ) { }

    async onModuleInit() {
        this.channel = await this.rabbit.createChannel();
        await this.setupTopology();
        await this.startConsuming();
    }

    private async setupTopology() {
        await this.channel.assertExchange('submit.exchange', 'direct', {
            durable: true,
        });

        await this.channel.assertExchange('submit.retry.exchange', 'direct', {
            durable: true,
        });

        await this.channel.assertExchange('submit.dlx', 'direct', {
            durable: true,
        });

        const { queue } = await this.channel.assertQueue('submit.queue', {
            durable: true,
            deadLetterExchange: 'submit.dlx',
        });

        await this.channel.assertQueue('submit.retry.queue', {
            durable: true,
            messageTtl: RETRY_DELAY_MS,
            deadLetterExchange: 'submit.exchange',
        });

        await this.channel.assertQueue('submit.dlq', {
            durable: true,
        });

        await this.channel.bindQueue(queue, 'submit.exchange', 'submit');
        await this.channel.bindQueue(
            'submit.retry.queue',
            'submit.retry.exchange',
            'submit',
        );
        await this.channel.bindQueue('submit.dlq', 'submit.dlx', 'submit');

        await this.channel.prefetch(1);
    }


    private async startConsuming() {
        await this.channel.consume(
            'submit.queue',
            (msg) => this.handleMessage(msg),
            { noAck: false },
        );
    }

    private async handleMessage(msg: ConsumeMessage | null) {
        if (!msg) return;

        const jobId = msg.properties.messageId;
        const job = JSON.parse(msg.content.toString());

        const headers = msg.properties.headers ?? {};
        const retryCount = Number(headers['x-retry-count'] ?? 0);

        try {
            await this.handler.handle(job);
            this.channel.ack(msg);
            console.log(`Job ${jobId} completed`);
        } catch (err) {
            if (retryCount >= MAX_RETRIES) {
                // Send to DLQ
                this.channel.nack(msg, false, false);
                console.error(
                    `Job ${jobId} failed permanently after ${retryCount} retries`,
                );
                return;
            }

            // Publish to retry queue with incremented retry count
            this.channel.publish(
                'submit.retry.exchange',
                'submit',
                msg.content,
                {
                    ...msg.properties,
                    headers: {
                        ...headers,
                        'x-retry-count': retryCount + 1,
                    },
                },
            );

            this.channel.ack(msg);

            console.warn(
                `Job ${jobId} failed, retry ${retryCount + 1}/${MAX_RETRIES}`,
            );
        }
    }
}
