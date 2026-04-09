import { Module } from '@nestjs/common';
import { MateriController } from './materi.controller';
import { MateriService } from './materi.service';

@Module({
    controllers: [MateriController],
    providers: [MateriService],
    exports: [MateriService],
})
export class MateriModule { }
