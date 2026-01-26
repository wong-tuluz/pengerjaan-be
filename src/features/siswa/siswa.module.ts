import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';
import { SiswaController } from './siswa.controller';
import { SiswaService } from './siswa-command.service';
import { SiswaQueryService } from './siswa-query.service';

@Module({
    imports: [DrizzleModule],
    controllers: [SiswaController],
    providers: [SiswaService, SiswaQueryService],
    exports: [SiswaQueryService],
})
export class SiswaModule {}
