import { workSessionTable } from "../../../infra/drizzle/schema";
import { TransactionManager } from "../../../infra/drizzle/transaction-manager";
import { Injectable } from "@nestjs/common";
import { WorkSession } from "../domain/session";
import { PaketSoalQueryService } from "../../persoalan/paket/paket-soal-query.service";
import { AppException } from "../../../common/exceptions/application.exception";
import { SessionQueryService } from "./session-query.service";
import { JadwalService } from "../../event/jadwal/services/jadwal.service";

@Injectable()
export class SessionManagerService {
    constructor(
        private readonly txm: TransactionManager,
        private readonly jadwalQuery: JadwalService,
        private readonly paketSoalQuery: PaketSoalQueryService,
        private readonly sessionQuery: SessionQueryService
    ) { }

    public async createSession(siswaId: string, jadwalId: string, token: string): Promise<{ id: string }> {
        const jadwal = await this.jadwalQuery.findById(jadwalId);
        if (!jadwal) {
            throw new AppException(`Jadwal ${jadwalId} tidak ditemukan.`)
        }
        if (jadwal.token != token) {
            throw new AppException('Invalid entry token')
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