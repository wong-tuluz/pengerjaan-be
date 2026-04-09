import { Post, Body, Get, Param, Controller } from "@nestjs/common";
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth'
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { PengerjaanService } from "../pengerjaan/pengerjaan.service";
import { PengerjaanStateService } from "./pengerjaan-state.service";
import { SiswaService } from "../siswa/siswa.service";

const SessionActionSchema = z.object({
    soalId: z.string().uuid(),
    marked: z.boolean().optional(),
    jawaban: z.array(
        z.object({
            jawabanSoalId: z.string().uuid().nullable(),
            value: z.string().nullable(),
        }),
    ),
});

export class SessionActionDto extends createZodDto(SessionActionSchema) { }

@Controller('work-session')
export class PengerjaanStateController {
    constructor(
        private readonly pengerjaanService: PengerjaanService,
        private readonly stateService: PengerjaanStateService,
        private readonly siswaService: SiswaService,
    ) { }

    @Get(':id/state')
    async getSessionState(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
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
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
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
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
        }

        await this.stateService.submitAction({
            workSessionId: sessionId,
            marked: body.marked,
            soalId: body.soalId,
            jawaban: body.jawaban,
        });

        return { success: true };
    }
}
