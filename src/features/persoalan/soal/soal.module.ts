import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../../infra/drizzle/drizzle.module';
import { PaketSoalController } from '../paket/paket-soal.controller';
import { MateriSoalController } from '../materi/materi-soal.controller';
import { SoalController } from './soal.controller';
import { SoalService } from './soal.service';
import { MateriSoalQueryService } from '../materi/materi-soal-query.service';
import { MateriSoalService } from '../materi/materi-soal.service';
import { PaketSoalQueryService } from '../paket/paket-soal-query.service';
import { PaketSoalService } from '../paket/paket-soal.service';
import { SoalQueryService } from './soal-query.service';

@Module({
    imports: [DrizzleModule],
    controllers: [SoalController, MateriSoalController, PaketSoalController],
    providers: [
        SoalService,
        SoalQueryService,
        PaketSoalQueryService,
        PaketSoalService,
        MateriSoalQueryService,
        MateriSoalService,
    ],
    exports: [
        PaketSoalQueryService,
        SoalQueryService,
    ]
})
export class SoalModule {}
