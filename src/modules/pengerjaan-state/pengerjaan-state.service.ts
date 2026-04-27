import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db, workSessionTable, soalTable, materiSoalTable, paketSoalTable, jawabanSoalTable, workSessionAnswerTable, workSessionMarkerTable } from 'src/common/db';
import { and, eq, inArray } from 'drizzle-orm';
import { shuffle } from 'src/utils/seedrand';
import { PengerjaanService } from '../pengerjaan/pengerjaan.service';

@Injectable()
export class PengerjaanStateService {
    constructor(
        private readonly pengerjaanService: PengerjaanService,
    ) { }

    async getState(sessionId: string) {
        const session = await this.pengerjaanService.findById(sessionId);

        const questionRows = await db
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
            return {
                id: session.id,
                status: session.status,
                questions: [],
            };
        }

        const [allOptions, allSessionAnswers, allMarkers] = await Promise.all([
            db.select().from(jawabanSoalTable).where(inArray(jawabanSoalTable.soalId, soalIds)),
            db.select().from(workSessionAnswerTable).where(and(
                eq(workSessionAnswerTable.workSessionId, sessionId),
                inArray(workSessionAnswerTable.soalId, soalIds)
            )),
            db.select().from(workSessionMarkerTable).where(and(
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

        let questions = questionRows.map((row) => {
            const soal = row.soal;
            const sessionAnswers = answersBySoal.get(soal.id) || [];
            const marker = markersBySoal.get(soal.id);

            const state: any = {
                index: 0,
                soalId: soal.id,
                type: soal.type,
                prompt: soal.prompt,
                isMarked: marker?.isMarked ?? false,
                isAnswered: sessionAnswers.length > 0,
            };

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

        return {
            id: session.id,
            status: session.status,
            strike: session.strike,
            questions,
        };
    }

    async getResult(sessionId: string) {
        const session = await this.pengerjaanService.findById(sessionId);

        const questionRows = await db
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
            return {
                id: session.id,
                status: session.status,
                questions: [],
            };
        }

        const [allOptions, allSessionAnswers, allMarkers] = await Promise.all([
            db.select().from(jawabanSoalTable).where(inArray(jawabanSoalTable.soalId, soalIds)),
            db.select().from(workSessionAnswerTable).where(and(
                eq(workSessionAnswerTable.workSessionId, sessionId),
                inArray(workSessionAnswerTable.soalId, soalIds)
            )),
            db.select().from(workSessionMarkerTable).where(and(
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

        let questions = questionRows.map((row) => {
            const soal = row.soal;
            const sessionAnswers = answersBySoal.get(soal.id) || [];
            const marker = markersBySoal.get(soal.id);

            const state: any = {
                index: 0,
                soalId: soal.id,
                type: soal.type,
                prompt: soal.prompt,
                isMarked: marker?.isMarked ?? false,
                isAnswered: sessionAnswers.length > 0,
            };

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

        return {
            id: session.id,
            jadwalId: session.jadwalId,
            paketSoalId: session.paketSoalId,
            status: session.status,
            startedAt: session.startedAt,
            finishedAt: session.finishedAt ?? null,
            questions,
        };
    }

    async submitAction(data: {
        workSessionId: string,
        soalId: string,
        marked?: boolean,
        jawaban: Array<{
            jawabanSoalId: string | null,
            value: string | null
        }>
    }) {
        const session = await this.pengerjaanService.findById(data.workSessionId);

        if (this.pengerjaanService.isExpired(session as any))
            throw new BadRequestException('Session expired');

        if (session.status != 'in_progress')
            throw new BadRequestException('Session stale');

        await db.transaction(async tx => {
            await tx.delete(workSessionAnswerTable).where(and(
                eq(workSessionAnswerTable.workSessionId, data.workSessionId),
                eq(workSessionAnswerTable.soalId, data.soalId)
            ));

            await tx.delete(workSessionMarkerTable).where(and(
                eq(workSessionMarkerTable.workSessionId, data.workSessionId),
                eq(workSessionMarkerTable.soalId, data.soalId)
            ));

            if (data.jawaban.length > 0) {
                await tx.insert(workSessionAnswerTable).values(
                    data.jawaban.map(x => ({
                        id: crypto.randomUUID(),
                        workSessionId: data.workSessionId,
                        soalId: data.soalId,
                        jawabanSoalId: x.jawabanSoalId,
                        value: x.value,
                    }))
                );
            }

            await tx.insert(workSessionMarkerTable).values({
                id: crypto.randomUUID(),
                workSessionId: data.workSessionId,
                soalId: data.soalId,
                isMarked: data.marked ?? false,
            });
        });
    }
}
