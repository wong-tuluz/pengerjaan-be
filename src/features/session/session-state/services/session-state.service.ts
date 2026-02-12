import { Inject, Injectable } from '@nestjs/common';
import z from 'zod';
import { READ_DB } from '../../../../common/config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import {
    jawabanSoalTable,
    materiSoalTable,
    paketSoalTable,
    soalTable,
    workSessionAnswerTable,
    workSessionMarkerTable,
    workSessionTable,
} from '../../../../infra/drizzle/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { shuffle } from '../../../../common/rng/seedrand';
import { AppException } from '../../../../common/exceptions/application.exception';
import { SessionDto, SessionQuestionState, SessionResultDto, SessionResultQuestionState } from './session-state.dto';
import { Session } from '../../session/domain/session';


@Injectable()
export class SessionStateService {
    constructor(
        @Inject(READ_DB) private readonly db: MySql2Database,
    ) { }

    async getState(sessionId: string): Promise<SessionDto> {
        const sessionRow = await this.db
            .select()
            .from(workSessionTable)
            .where(eq(workSessionTable.id, sessionId))
            .limit(1)
            .then((rows) => rows[0]);

        if (!sessionRow) {
            throw new AppException('Session not found', 404);
        }

        const session = new Session(sessionRow);

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

        const soalIds = questionRows.map(r => r.soal.id);

        if (soalIds.length === 0) {
            const obj = new SessionDto();
            obj.id = session.id;
            obj.status = session.status
            obj.questions = [];
            return obj;
        }

        const [allOptions, allSessionAnswers, allMarkers] = await Promise.all([
            this.db.select().from(jawabanSoalTable).where(inArray(jawabanSoalTable.soalId, soalIds)),
            this.db.select().from(workSessionAnswerTable).where(and(
                eq(workSessionAnswerTable.workSessionId, sessionId),
                inArray(workSessionAnswerTable.soalId, soalIds)
            )),
            this.db.select().from(workSessionMarkerTable).where(and(
                eq(workSessionMarkerTable.workSessionId, sessionId),
                inArray(workSessionMarkerTable.soalId, soalIds)
            ))
        ]);

        const optionsBySoal = new Map<string, typeof allOptions>();
        for (const opt of allOptions) {
            const list = optionsBySoal.get(opt.soalId) || [];
            list.push(opt);
            optionsBySoal.set(opt.soalId, list);
        }

        const answersBySoal = new Map<string, typeof allSessionAnswers>();
        for (const ans of allSessionAnswers) {
            const list = answersBySoal.get(ans.soalId) || [];
            list.push(ans);
            answersBySoal.set(ans.soalId, list);
        }

        const markersBySoal = new Map<string, typeof allMarkers[0]>();
        for (const marker of allMarkers) {
            markersBySoal.set(marker.soalId, marker);
        }

        let questions: SessionQuestionState[] = questionRows.map((row) => {
            const soal = row.soal;
            const state = new SessionQuestionState();
            state.index = 0;
            state.soalId = soal.id;
            state.type = soal.type;
            state.prompt = soal.prompt;

            const sessionAnswers = answersBySoal.get(soal.id) || [];
            const marker = markersBySoal.get(soal.id);

            state.isMarked = marker?.isMarked ?? false;
            state.isAnswered = sessionAnswers.length > 0;

            if (soal.type === 'essay') {
                if (sessionAnswers.length > 0) {
                    state.options = [
                        {
                            value: sessionAnswers[0].value ?? '',
                            isSelected: true,
                        },
                    ];
                }
            } else {
                const choices = optionsBySoal.get(soal.id) || [];
                const selectedAnswerIds = new Set(
                    sessionAnswers.map((a) => a.jawabanSoalId).filter(Boolean),
                );

                state.options = shuffle(choices
                    .sort((a, b) => a.order - b.order)
                    .map((choice) => ({
                        jawabanSoalId: choice.id,
                        value: choice.value,
                        isSelected: selectedAnswerIds.has(choice.id),
                    })), session.siswaId);
            }

            return state;
        });

        questions = shuffle(questions, session.siswaId);

        questions.forEach((q, i) => {
            q.index = i + 1;
        });

        const obj = new SessionDto();
        obj.id = session.id;
        obj.status = session.status;
        obj.questions = questions;

        return obj;
    }

    async getResult(sessionId: string): Promise<SessionResultDto> {
        const sessionRow = await this.db
            .select()
            .from(workSessionTable)
            .where(eq(workSessionTable.id, sessionId))
            .limit(1)
            .then((rows) => rows[0]);

        if (!sessionRow) {
            throw new AppException('Session not found', 404);
        }

        const session = new Session(sessionRow);

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

        const soalIds = questionRows.map(r => r.soal.id);

        if (soalIds.length === 0) {
            const obj = new SessionResultDto();
            obj.id = session.id;
            obj.status = session.status;
            obj.questions = [];
            return obj;
        }

        const [allOptions, allSessionAnswers, allMarkers] = await Promise.all([
            this.db.select().from(jawabanSoalTable).where(inArray(jawabanSoalTable.soalId, soalIds)),
            this.db.select().from(workSessionAnswerTable).where(and(
                eq(workSessionAnswerTable.workSessionId, sessionId),
                inArray(workSessionAnswerTable.soalId, soalIds)
            )),
            this.db.select().from(workSessionMarkerTable).where(and(
                eq(workSessionMarkerTable.workSessionId, sessionId),
                inArray(workSessionMarkerTable.soalId, soalIds)
            ))
        ]);

        const optionsBySoal = new Map<string, typeof allOptions>();
        for (const opt of allOptions) {
            const list = optionsBySoal.get(opt.soalId) || [];
            list.push(opt);
            optionsBySoal.set(opt.soalId, list);
        }

        const answersBySoal = new Map<string, typeof allSessionAnswers>();
        for (const ans of allSessionAnswers) {
            const list = answersBySoal.get(ans.soalId) || [];
            list.push(ans);
            answersBySoal.set(ans.soalId, list);
        }

        const markersBySoal = new Map<string, typeof allMarkers[0]>();
        for (const marker of allMarkers) {
            markersBySoal.set(marker.soalId, marker);
        }

        let questions: SessionResultQuestionState[] = questionRows.map((row) => {
            const soal = row.soal;
            const state = new SessionResultQuestionState();
            state.index = 0;
            state.soalId = soal.id;
            state.type = soal.type;
            state.prompt = soal.prompt;

            const sessionAnswers = answersBySoal.get(soal.id) || [];
            const marker = markersBySoal.get(soal.id);

            state.isMarked = marker?.isMarked ?? false;
            state.isAnswered = sessionAnswers.length > 0;

            if (soal.type === 'essay') {
                if (sessionAnswers.length > 0) {
                    state.options = [
                        {
                            value: sessionAnswers[0].value ?? '',
                            isSelected: true,
                            isCorrect: false,
                        },
                    ];
                }
            } else {
                const choices = optionsBySoal.get(soal.id) || [];
                const selectedAnswerIds = new Set(
                    sessionAnswers.map((a) => a.jawabanSoalId).filter(Boolean),
                );

                state.options = shuffle(choices
                    .sort((a, b) => a.order - b.order)
                    .map((choice) => ({
                        jawabanSoalId: choice.id,
                        value: choice.value,
                        isSelected: selectedAnswerIds.has(choice.id),
                        isCorrect: choice.isCorrect,
                    })), session.siswaId);
            }

            return state;
        });

        questions = shuffle(questions, session.siswaId);

        questions.forEach((q, i) => {
            q.index = i + 1;
        });

        const obj = new SessionResultDto();
        obj.id = session.id;
        obj.status = session.status;
        obj.questions = questions;
        obj.jadwalId = session.jadwalId;
        obj.paketSoalId = session.paketSoalId;
        obj.startedAt = session.startedAt;
        obj.finishedAt = session.finishedAt ?? null;

        return obj;
    }
}
