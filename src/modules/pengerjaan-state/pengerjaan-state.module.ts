import { Module } from '@nestjs/common';
import { SiswaModule } from '../siswa/siswa.module';
import { PengerjaanModule } from '../pengerjaan/pengerjaan.module';
import { PengerjaanStateController } from './pengerjaan-state.controller';
import { PengerjaanStateService } from './pengerjaan-state.service';

@Module({
    imports: [SiswaModule, PengerjaanModule],
    controllers: [PengerjaanStateController],
    providers: [PengerjaanStateService],
    exports: [PengerjaanStateService],
})
export class PengerjaanStateModule { }
