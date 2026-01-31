import { Post, Req, Body, NotFoundException, Get, Param, Controller } from "@nestjs/common";
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth'
import { SessionService } from "../../session/services/session.service";
import { SessionStateService } from "../services/session-state.service";
import { SiswaService } from "../../../siswa/services/siswa.service";
import { SubmitService } from "../services/submit.service";
import { SessionActionDto } from "./session-state.dto";

@Controller('work-session')
export class SessionStateController {
    constructor(
        private readonly sessionService: SessionService,
        private readonly stateService: SessionStateService,
        private readonly siswaService: SiswaService,
        private readonly submitService: SubmitService
    ) { }

    @Get(':id/state')
    async getSessionState(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            this.sessionService.hasAccess(sessionId, siswa.id)
        }

        return await this.stateService.getState(sessionId);
    }

    @Get(':id/result')
    async getSessionResult(
        @Session() session: UserSession,
        @Param('id') sessionId: string,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            this.sessionService.hasAccess(sessionId, siswa.id)
        }

        return await this.stateService.getResult(sessionId);
    }

    @Post(':id/submit')
    async submitAction(
        @Session() session: UserSession,
        @Param('id') sessionId: string,
        @Body() body: SessionActionDto,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            this.sessionService.hasAccess(sessionId, siswa.id)
        }

        return await this.submitService.publishSubmit({
            workSessionId: sessionId,
            marked: body.marked,
            soalId: body.soalId,
            jawaban: body.jawaban,
        });
    }
}