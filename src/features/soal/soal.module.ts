import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../infra/drizzle/drizzle.module';
import { PaketSoalController } from './controllers/paket-soal.controller';
import { MateriSoalController } from './controllers/materi-soal.controller';
import { SoalController } from './controllers/soal.controller';
import { SoalService } from './services/soal.service';
import { MateriSoalQueryService } from './services/materi-soal-query.service';
import { MateriSoalService } from './services/materi-soal.service';
import { PaketSoalQueryService } from './services/paket-soal-query.service';
import { PaketSoalService } from './services/paket-soal.service';
import { SoalQueryService } from './services/soal-query.service';

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
