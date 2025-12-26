// repository/session.write.repository.ts
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { sessions, sessionAnswers, sessionMarkers } from "@/modules/drizzle/schema";
import { Session, SessionAnswer } from "../domain/session";
import { UnitOfWork } from "@/core/uow/uow";
import { READ_DB } from "@/core/constants/db.constants";
import { MySql2Database } from "drizzle-orm/mysql2";
import { v7 } from "uuid";

@Injectable()
export class SessionWriteRepository {

    constructor(
        @Inject(READ_DB) private readonly readDb: MySql2Database,
    ) { }

    async findById(id: string): Promise<Session | null> {
        const rows = await this.readDb
            .select({ s: sessions, a: sessionAnswers })
            .from(sessions)
            .leftJoin(sessionAnswers, eq(sessionAnswers.sessionId, sessions.id))
            .where(eq(sessions.id, id));

        if (!rows.length) return null;

        const session = new Session();
        session.id = rows[0].s.id;
        session.questionGroupId = rows[0].s.questionGroupId;
        session.answers = [];

        for (const row of rows) {
            if (!row.a) continue;
            session.answers.push(
                new SessionAnswer(
                    row.a.sessionId,
                    row.a.questionId,
                    row.a.answerId,
                    row.a.value
                )
            );
        }

        return session;
    }

    async save(uow: UnitOfWork, session: Session): Promise<void> {
        // --- upsert header ---
        const existing = await uow.tx.select().from(sessions).where(eq(sessions.id, session.id));
        if (existing.length === 0) {
            await uow.tx.insert(sessions).values({
                id: session.id,
                questionGroupId: session.questionGroupId,
                studentId: v7(),
                createdAt: new Date(),
                finishedAt: null
            });
        }

        // --- load existing children to diff ---
        const existingAnswers = await uow.tx.select().from(sessionAnswers)
            .where(eq(sessionAnswers.sessionId, session.id));
        const existingMarkers = await uow.tx.select().from(sessionMarkers)
            .where(eq(sessionMarkers.sessionId, session.id));

        // DIFF logic – answers
        for (const a of session.answers) {
            const found = existingAnswers.find(x => x.questionId === a.questionId);
            if (!found) {
                await uow.tx.insert(sessionAnswers).values({
                    id: a.id,
                    sessionId: session.id,
                    questionId: a.questionId,
                    answerId: a.answerId,
                    value: a.value
                });
            } else if (found.answerId !== a.answerId || found.value !== a.value) {
                await uow.tx.update(sessionAnswers)
                    .set({
                        answerId: a.answerId,
                        value: a.value
                    })
                    .where(and(
                        eq(sessionAnswers.sessionId, session.id),
                        eq(sessionAnswers.questionId, a.questionId)
                    ))
            }
        }

        // DIFF logic – markers
        for (const m of session.marks) {
            const found = existingMarkers.find(x => x.questionId === m.questionId);
            if (!found) {
                await uow.tx.insert(sessionMarkers).values({
                    id: m.id,
                    sessionId: session.id,
                    questionId: m.questionId,
                    isMarked: m.isMarked
                });
            } else if (found.isMarked !== m.isMarked) {
                await uow.tx.update(sessionMarkers)
                    .set({ isMarked: m.isMarked })
                    .where(and(
                        eq(sessionMarkers.sessionId, session.id),
                        eq(sessionMarkers.questionId, m.questionId)
                    ))
            }
        }
    }
}
