import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel, Connection, connect } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private connection!: Connection;

    async onModuleInit() {
        this.connection = await connect(
            'amqp://app_user:app_password@localhost:5672',
        );
    }

    async createChannel(): Promise<Channel> {
        if (!this.connection) {
            throw new Error('RabbitMQ connection not initialized');
        }

        return this.connection.createChannel();
    }

    async onModuleDestroy() {
        await this.connection?.close();
    }
}
