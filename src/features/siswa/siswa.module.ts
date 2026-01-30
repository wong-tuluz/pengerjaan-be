import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';
import { ProfileController, SiswaController } from './api/siswa.controller';
import { SiswaService } from './services/siswa.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DrizzleModule],
    controllers: [SiswaController, ProfileController],
    providers: [SiswaService],
    exports: [SiswaService],
})
export class SiswaModule { }
