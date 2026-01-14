import { Inject, Injectable } from '@nestjs/common';
import { READ_DB } from '../../../config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { and, eq } from 'drizzle-orm';
import {
    workSessionAnswerTable,
    workSessionMarkerTable,
    workSessionTable,
} from '../../../infra/drizzle/schema';

@Injectable()
export class SessionQueryService {
    constructor(@Inject(READ_DB) private readonly db: MySql2Database) { }

    async getSessions(
        siswaId?: string | null,
        jadwalId?: string | null,
    ): Promise<{
        id: string;
        siswaId: string;
        jadwalId: string;
        paketSoalId: string;
        materiSoalId: string | null;
        timeLimit: number;
        startedAt: Date;
        finishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date | null;
    }[]> {
        console.log(siswaId)

        const filters = [
            siswaId ? eq(workSessionTable.siswaId, siswaId) : undefined,
            jadwalId ? eq(workSessionTable.jadwalId, jadwalId) : undefined,
        ].filter(Boolean);

        const sessions = await this.db
            .select()
            .from(workSessionTable)
            .where(and(...filters));

        return sessions
    }

    async getSessionById(id: string, siswaId?: string): Promise<{
        id: string;
        siswaId: string;
        jadwalId: string;
        paketSoalId: string;
        materiSoalId: string | null;
        timeLimit: number;
        startedAt: Date;
        finishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date | null;
    } | null> {
        const row = await this.db
            .select()
            .from(workSessionTable)
            .where(eq(workSessionTable.id, id))
            .then((rows) => rows[0]);

        return row ?? null
    }

    async getSessionAnswer(
        sessionId: string,
        questionId: string,
    ): Promise<
        | {
            id: string;
            workSessionId: string;
            soalId: string;
            jawabanSoalId: string | null;
            value: string | null;
            createdAt: Date;
            updatedAt: Date | null;
        }[]
        | null
    > {
        const rows = await this.db
            .select()
            .from(workSessionAnswerTable)
            .where(
                and(
                    eq(workSessionAnswerTable.workSessionId, sessionId),
                    eq(workSessionAnswerTable.soalId, questionId),
                ),
            );

        return rows;
    }

    async getSessionMarker(
        sessionId: string,
        questionId: string,
    ): Promise<{
        id: string;
        workSessionId: string;
        soalId: string;
        isMarked: boolean;
    } | null> {
        const row = await this.db
            .select()
            .from(workSessionMarkerTable)
            .where(
                and(
                    eq(workSessionMarkerTable.workSessionId, sessionId),
                    eq(workSessionMarkerTable.soalId, questionId),
                ),
            )
            .limit(1)
            .then((rows) => rows[0]);

        return row ?? null;
    }
}
