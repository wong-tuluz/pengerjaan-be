import { Inject, Injectable } from '@nestjs/common';
import { SubmitContract } from '../jobs/submit.contract';
import { READ_DB } from '@/config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { TransactionManager } from '@/infra/drizzle/transaction-manager';
import { SessionManagerService } from './session-manager.service';
import { workSessionAnswerTable, workSessionMarkerTable, workSessionTable } from '@/infra/drizzle/schema';
import { eq } from 'drizzle-orm';
import { AppException } from '@/infra/exceptions/app-exception';
import { WorkSession, WorkSessionJawaban } from '../domain/session';

@Injectable()
export class SubmitHandlerService {
    constructor(
        @Inject(READ_DB) private readonly db: MySql2Database,
        private readonly txm: TransactionManager
    ) { }

    async handle(data: SubmitContract): Promise<void> {
        const sessionRow = await this.db.select()
            .from(workSessionTable)
            .where(eq(workSessionTable.id, data.workSessionId))
            .then((rows) => rows[0])

        if (!sessionRow)
            throw new AppException(`Session not found.`)

        const session = new WorkSession()
        session.map(sessionRow)
        
        console.log(data)
        

        session.submitAnswer(data.soalId, data.jawaban.map(x => WorkSessionJawaban.create(session.id, data.soalId, x.jawabanSoalId, x.value)))

        if (data.marked) {
            session.markQuestion(data.soalId, data.marked)
        }

        this.txm.run(async ctx => {
            await ctx.tx.delete(workSessionAnswerTable).where(eq(workSessionAnswerTable.soalId, data.soalId))
            await ctx.tx.delete(workSessionMarkerTable).where(eq(workSessionMarkerTable.soalId, data.soalId))

            for (const answer of session.answers) {
                await ctx.tx.insert(workSessionAnswerTable).values(answer)
            }

            for (const marker of session.marks) {
                await ctx.tx.insert(workSessionMarkerTable).values(marker)
            }
        })
    }
}
