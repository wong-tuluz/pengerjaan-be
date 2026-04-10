import { FactoryProvider } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

export const redisInstance = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
});

export const RedisProvider: FactoryProvider = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    return redisInstance;
  },
};
