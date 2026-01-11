import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';
import { SiswaController } from './api/siswa.controller';
import { SiswaService } from './services/siswa.service';
import { SiswaQueryService } from './services/siswa-query.service';

@Module({
    imports: [DrizzleModule],
    controllers: [SiswaController],
    providers: [SiswaService, SiswaQueryService],
})
export class SiswaModule {}
