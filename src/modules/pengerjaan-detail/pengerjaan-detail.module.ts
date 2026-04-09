import { Module } from '@nestjs/common';
import { SiswaModule } from '../siswa/siswa.module';
import { JadwalModule } from '../jadwal/jadwal.module';
import { PengerjaanModule } from '../pengerjaan/pengerjaan.module';
import { PengerjaanStateModule } from '../pengerjaan-state/pengerjaan-state.module';
import { PengerjaanDetailController } from './pengerjaan-detail.controller';
import { PengerjaanDetailService } from './pengerjaan-detail.service';

@Module({
    imports: [SiswaModule, JadwalModule, PengerjaanModule, PengerjaanStateModule],
    controllers: [PengerjaanDetailController],
    providers: [PengerjaanDetailService],
    exports: [PengerjaanDetailService],
})
export class PengerjaanDetailModule { }
