import { Module } from '@nestjs/common';
import { drizzleProviders } from './drizzle.providers';

@Module({
    providers: [...drizzleProviders],
    exports: [...drizzleProviders],
})
export class DrizzleModule {}
