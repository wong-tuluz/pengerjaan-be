import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Channel, Connection, connect } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name);
    private connection: Connection | null = null;
    private connecting = false;

    private async lazyConnect(): Promise<Connection> {
        if (this.connection) {
            return this.connection;
        }

        if (this.connecting) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.lazyConnect();
        }

        this.connecting = true;

        while (!this.connection) {
            try {
                this.logger.log('Connecting to RabbitMQ...');
                this.connection = await connect(process.env.RABBITMQ_URL!);

                this.connection.on('close', () => {
                    this.logger.warn('RabbitMQ connection closed, retrying...');
                    this.connection = null;
                });

                this.connection.on('error', err => {
                    this.logger.error('RabbitMQ error', err);
                });

                this.logger.log('RabbitMQ connected');
            } catch (err) {
                this.logger.error('RabbitMQ connection failed, retrying in 5s');
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        this.connecting = false;
        return this.connection;
    }

    async createChannel(): Promise<Channel> {
        const conn = await this.lazyConnect();
        return conn.createChannel();
    }

    async onModuleDestroy() {
        await this.connection?.close();
    }
}
