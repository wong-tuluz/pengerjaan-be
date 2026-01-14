import { workSessionTable } from "../../../infra/drizzle/schema";
import { TransactionManager } from "../../../infra/drizzle/transaction-manager";
import { Injectable } from "@nestjs/common";
import { WorkSession } from "../domain/session";
import { AgendaQueryService } from "../../../features/agenda/services/agenda-query.service";
import { PaketSoalQueryService } from "../../../features/soal/services/paket-soal-query.service";
import { AppException } from "../../../infra/exceptions/app-exception";
import { SessionQueryService } from "./session-query.service";
import { JadwalQueryService } from "../../agenda/services/jadwal-query.service";

@Injectable()
export class SessionManagerService {
    constructor(
        private readonly txm: TransactionManager,
        private readonly jadwalQuery: JadwalQueryService,
        private readonly paketSoalQuery: PaketSoalQueryService,
        private readonly sessionQuery: SessionQueryService
    ) { }

    public async createSession(siswaId: string, jadwalId: string): Promise<{ id: string }> {
        const jadwal = await this.jadwalQuery.getById(jadwalId);
        if (!jadwal) {
            throw new AppException(`Jadwal ${jadwalId} tidak ditemukan.`)
        }

        const paketSoal = await this.paketSoalQuery.getById(jadwal.paketSoalId)
        if (!paketSoal) {
            throw new AppException(`Paket soal ${jadwal.paketSoalId} tidak ditemukan.`)
        }

        const sessions = await this.sessionQuery.getSessions(siswaId, jadwal.id)
        if (sessions.length >= jadwal.attempts) {
            throw new AppException(`Semua percobaan telah dipakai`)
        }

        const workSession = WorkSession.create(siswaId, jadwalId, jadwal.timeLimit, paketSoal.id)

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