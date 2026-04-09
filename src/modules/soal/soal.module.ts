import { Module } from '@nestjs/common';
import { SoalController } from './soal.controller';
import { SoalService } from './soal.service';

@Module({
    controllers: [SoalController],
    providers: [SoalService],
    exports: [SoalService],
})
export class SoalModule { }
