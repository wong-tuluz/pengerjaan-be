import { Injectable } from "@nestjs/common";
import { SessionService } from "../session/services/session.service";
import { SiswaService } from "../../siswa/services/siswa.service";
import { JadwalService } from "../../event/jadwal/services/jadwal.service";
import { SessionStateService } from "../session-state/services/session-state.service";
import { SessionStatus } from "../session/domain/session";

@Injectable()
export class SessionDetailService {
    constructor(
        private readonly stateService: SessionStateService,
        private readonly sessionService: SessionService,
        private readonly siswaService: SiswaService,
        private readonly jadwalService: JadwalService
    ) { }

    async listAll(filter?: {
        siswaId?: string,
        jadwalId?: string,
        status?: SessionStatus
    }) {
        const data = await this.sessionService.listAll(filter)

        const res = Promise.all(data.map(async x => {
            const state = await this.stateService.getState(x.id);
            const jadwal = await this.jadwalService.findById(x.jadwalId);
            const siswa = await this.siswaService.findById(x.siswaId);

            return {
                id: x.id,
                status: state.status,
                timeLimit: x.timeLimit,
                finishedAt: x.finishedAt,
                questionCount: state.questions.length,
                questionAnswered: state.questions.filter(x => x.isAnswered).length,
                jadwal,
                siswa
            }
        }))

        return res
    }
}