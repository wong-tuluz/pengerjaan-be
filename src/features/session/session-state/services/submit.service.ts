import { Inject } from "@nestjs/common"
import { eq } from "drizzle-orm"
import { MySql2Database } from "drizzle-orm/mysql2"
import { WRITE_DB } from "../../../../common/config/db.constants"
import { workSessionAnswerTable, workSessionMarkerTable } from "../../../../infra/drizzle/schema"
import { SessionService } from "../../session/services/session.service"
import { SessionAnswer } from "../domain/session-answer"
import { SessionMark } from "../domain/session-mark"
import { createZodDto } from "nestjs-zod"
import z from "zod"

const SubmitContractSchema = z.object({
    workSessionId: z.uuid(),
    soalId: z.uuid(),
    marked: z.boolean().optional(),
    jawaban: z.array(z.object({
        jawabanSoalId: z.uuid().nullable(),
        value: z.string().nullable()
    }))
});

export class SubmitContract extends createZodDto(SubmitContractSchema) { }

export class SubmitService {
    constructor(
        @Inject(WRITE_DB) private readonly db: MySql2Database,
        private readonly sessionService: SessionService
    ) { }

    async publishSubmit(payload: SubmitContract) {
        return await this.handle(payload)
    }

    private async handle(data: SubmitContract): Promise<void> {
        const session = await this.sessionService.findById(data.workSessionId)

        if (session.isExpired())
            throw new Error('Session expired')

        if (session.status != 'in_progress')
            throw new Error('Session stale')

        const answers = data.jawaban.map(x => SessionAnswer.create(session.id, data.soalId, x.jawabanSoalId, x.value))
        const marks = SessionMark.create(data.workSessionId, data.soalId, data.marked ?? false)

        this.db.transaction(async tx => {
            await tx.delete(workSessionAnswerTable).where(eq(workSessionAnswerTable.soalId, data.soalId))
            await tx.delete(workSessionMarkerTable).where(eq(workSessionMarkerTable.soalId, data.soalId))

            for (const answer of answers) {
                await tx.insert(workSessionAnswerTable).values(answer)
            }

            await tx.insert(workSessionMarkerTable).values(marks)
        })
    }
}