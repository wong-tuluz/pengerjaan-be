import { Module } from '@nestjs/common';
import { PaketSoalController } from './paket-soal.controller';
import { PaketSoalService } from './paket-soal.service';

@Module({
    controllers: [PaketSoalController],
    providers: [PaketSoalService],
    exports: [PaketSoalService],
})
export class PaketSoalModule { }
