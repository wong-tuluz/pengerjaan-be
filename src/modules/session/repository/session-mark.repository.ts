import { UnitOfWork } from '@/core/uow/uow';
import { SessionMarker } from '../domain/session';
import { sessionMarkers } from '@/modules/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { READ_DB } from '@/core/constants/db.constants';
import { Inject } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';

export class SessionMarkRepository {
    constructor(@Inject(READ_DB) private readonly readDb: MySql2Database) {}

    async findBySession(sessionId: string): Promise<SessionMarker[]> {
        var rows = await this.readDb
            .select()
            .from(sessionMarkers)
            .where(eq(sessionMarkers.sessionId, sessionId));

        return rows.map(
            (r) =>
                new SessionMarker(r.id, r.sessionId, r.questionId, r.isMarked),
        );
    }

    async upsert(uow: UnitOfWork, a: SessionMarker) {
        await uow.tx
            .insert(sessionMarkers)
            .values({
                id: a.id,
                sessionId: a.sessionId,
                questionId: a.questionId,
                isMarked: a.isMarked,
            })
            .onDuplicateKeyUpdate({
                set: {
                    isMarked: a.isMarked,
                },
            });
    }

    async deleteByQuestion(
        uow: UnitOfWork,
        sessionId: string,
        questionId: string,
    ) {
        await uow.tx
            .delete(sessionMarkers)
            .where(
                and(
                    eq(sessionMarkers.sessionId, sessionId),
                    eq(sessionMarkers.questionId, questionId),
                ),
            );
    }
}
