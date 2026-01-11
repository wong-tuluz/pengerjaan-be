import { Module } from '@nestjs/common';
import { drizzleProviders } from './drizzle.providers';
import { TransactionManager } from './transaction-manager';

@Module({
    providers: [...drizzleProviders, TransactionManager],
    exports: [...drizzleProviders, TransactionManager],
})
export class DrizzleModule {}
