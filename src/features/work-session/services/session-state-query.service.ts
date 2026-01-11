import { Inject, Injectable } from '@nestjs/common';
import z from 'zod';
import { READ_DB } from '../../../config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import {
    jawabanSoalTable,
    materiSoalTable,
    paketSoalTable,
    soalTable,
    workSessionAnswerTable,
    workSessionMarkerTable,
    workSessionTable,
} from '../../../infra/drizzle/schema';
import { and, eq, or } from 'drizzle-orm';
import { WorkSession } from '../domain/session';
import { createZodDto } from 'nestjs-zod';
import { SoalQueryService } from '../../soal/services/soal-query.service';
import { SessionQueryService } from './session-query.service';
import { shuffle } from '@/infra/rng/seedrand';

const SessionQuestionAnswerSchema = z.object({
    jawabanSoalId: z.uuid().optional(),
    value: z.string(),
    isSelected: z.boolean(),
});

const SessionQuestionSchema = z.object({
    soalId: z.uuid(),
    prompt: z.string(),
    type: z.enum(['multiple-choice', 'essay', 'true-false', 'complex-choice']),
    jawaban: z.array(SessionQuestionAnswerSchema).optional(),
});

const SessionSchema = z.object({
    id: z.uuid(),
    status: z.enum(['active', 'completed', 'expired']),
    questions: z.array(SessionQuestionSchema),
});

class SessionQuestionState extends createZodDto(SessionQuestionSchema) {}

class SessionDto extends createZodDto(SessionSchema) {}

@Injectable()
export class SessionStateQueryService {
    constructor(
        @Inject(READ_DB) private readonly db: MySql2Database,
        private readonly soalQuery: SoalQueryService,
        private readonly sessionQuery: SessionQueryService,
    ) {}

    async getSessionState(sessionId: string): Promise<SessionDto> {
        const sessionRow = await this.db
            .select()
            .from(workSessionTable)
            .where(eq(workSessionTable.id, sessionId))
            .limit(1)
            .then((rows) => rows[0]);

        if (!sessionRow) {
            throw new Error('Session not found');
        }

        const session = new WorkSession();
        session.map(sessionRow);

        const questionRows = await this.db
            .select({ soal: soalTable })
            .from(soalTable)
            .innerJoin(
                materiSoalTable,
                eq(soalTable.materiSoalId, materiSoalTable.id),
            )
            .leftJoin(
                paketSoalTable,
                eq(materiSoalTable.paketSoalId, paketSoalTable.id),
            )
            .where(
                session.materiSoalId
                    ? eq(materiSoalTable.id, session.materiSoalId)
                    : eq(paketSoalTable.id, session.paketSoalId),
            );

        var questions = await Promise.all(
            questionRows.map((q) =>
                this.getSessionQuestionState(sessionId, q.soal),
            ),
        );

        questions = shuffle(questions, session.siswaId);

        const obj = new SessionDto();
        ((obj.id = session.id),
            (obj.status = session.finishedAt ? 'completed' : 'active'));
        obj.questions = questions;

        return obj;
    }

    private async getSessionQuestionState(
        sessionId: string,
        soal: {
            id: string;
            type: 'multiple-choice' | 'essay' | 'complex-choice';
            prompt: string;
        },
    ): Promise<SessionQuestionState> {
        const state = new SessionQuestionState();

        state.soalId = soal.id;
        state.type = soal.type;
        state.prompt = soal.prompt;

        if (soal.type === 'essay') {
            const answers = await this.sessionQuery.getSessionAnswer(
                sessionId,
                soal.id,
            );

            if (answers && answers.length > 0) {
                state.jawaban = [
                    {
                        value: answers[0].value ?? '',
                        isSelected: true,
                    },
                ];
            }

            return state;
        }

        const [choices, sessionAnswers] = await Promise.all([
            this.soalQuery.getJawaban(soal.id),
            this.sessionQuery.getSessionAnswer(sessionId, soal.id),
        ]);

        const selectedAnswerIds = new Set(
            (sessionAnswers ?? []).map((a) => a.jawabanSoalId).filter(Boolean),
        );

        state.jawaban = choices
            .sort((a, b) => a.order - b.order)
            .map((choice) => ({
                jawabanSoalId: choice.id,
                value: choice.value,
                isSelected: selectedAnswerIds.has(choice.id),
            }));

        return state;
    }
}
