import { Module } from '@nestjs/common';
import { SiswaModule } from '../siswa/siswa.module';
import { JadwalModule } from '../jadwal/jadwal.module';
import { PengerjaanController } from './pengerjaan.controller';
import { PengerjaanService } from './pengerjaan.service';
import { PengerjaanCronService } from './pengerjaan-cron.service';

@Module({
    imports: [SiswaModule, JadwalModule],
    controllers: [PengerjaanController],
    providers: [PengerjaanService, PengerjaanCronService],
    exports: [PengerjaanService],
})
export class PengerjaanModule { }
