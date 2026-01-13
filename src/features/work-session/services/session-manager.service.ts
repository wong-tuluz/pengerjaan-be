import { workSessionTable } from "../../../infra/drizzle/schema";
import { TransactionManager } from "../../../infra/drizzle/transaction-manager";
import { Injectable } from "@nestjs/common";
import { WorkSession } from "../domain/session";
import { AgendaQueryService } from "../../../features/agenda/services/agenda-query.service";
import { PaketSoalQueryService } from "../../../features/soal/services/paket-soal-query.service";
import { AppException } from "../../../infra/exceptions/app-exception";
import { SessionQueryService } from "./session-query.service";

@Injectable()
export class SessionManagerService {
    constructor(
        private readonly txm: TransactionManager,
        private readonly agendaQuery: AgendaQueryService,
        private readonly paketSoalQuery: PaketSoalQueryService
    ) { }

    public async createSession(siswaId: string, jadwalId: string): Promise<{ id: string }> {
        const jadwal = await this.agendaQuery.getJadwal(jadwalId);
        if (!jadwal)
            throw new AppException(`Jadwal ${jadwalId} tidak ditemukan.`)

        const paketSoal = await this.paketSoalQuery.getById(jadwal.paketSoalId)
        if (!paketSoal)
            throw new AppException(`Paket soal ${jadwal.paketSoalId} tidak ditemukan.`)

        const workSession = WorkSession.create(siswaId, jadwalId, paketSoal.timeLimit, paketSoal.id)

        console.log(workSession)

        await this.txm.run(async ctx => {
            await ctx.tx.insert(workSessionTable).values(workSession)
        })

        return { id: workSession.id }
    }

    public async finishSession(sessionId: string) {
        // const sessionRow = await this.sessionQuery.getSessionById(sessionId)
        

        // const session = new WorkSession()
        // session.map(sessionRow)
    }
}