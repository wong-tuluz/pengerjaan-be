import { Injectable } from '@nestjs/common';
import { TransactionManager } from '../drizzle/transaction-manager';
import {
    siswaTable,
    agendaTable,
    agendaSiswaTable,
    jadwalTable,
    paketSoalTable,
    materiSoalTable,
    soalTable,
    jawabanSoalTable,
} from '../drizzle/schema';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class Seeder {
    constructor(private readonly txm: TransactionManager) {}

    async seed() {
        await this.txm.run(async (ctx) => {
            /* =======================
               SISWA
            ======================= */
            const siswaId = uuidv7();

            await ctx.tx.insert(siswaTable).values({
                id: siswaId,
                nama: 'Budi Santoso',
                nis: '2024001',
                kelas: 'X-A',
                username: 'budi',
                passwordHash:
                    '$2b$10$yHqfJ9Q2sH3J8eJ3v0G3Ae6QK8n9X2b7KXlQzR0q7V7c8K',
            });

            /* =======================
               PAKET SOAL
            ======================= */
            const paketSoalId = uuidv7();

            await ctx.tx.insert(paketSoalTable).values({
                id: paketSoalId,
                title: 'Ujian Matematika Dasar',
                description: 'Ujian untuk mengukur pemahaman dasar matematika',
                timeLimit: 90,
            });

            /* =======================
               MATERI SOAL
            ======================= */
            const materiId = uuidv7();

            await ctx.tx.insert(materiSoalTable).values({
                id: materiId,
                paketSoalId,
                title: 'Aljabar Dasar',
                description: 'Penjumlahan dan pengurangan bilangan',
                order: 1,
                timeLimit: 30,
            });

            /* =======================
               SOAL
            ======================= */
            const soalId = uuidv7();

            await ctx.tx.insert(soalTable).values({
                id: soalId,
                materiSoalId: materiId,
                type: 'multiple-choice',
                prompt: 'Hasil dari 5 + 7 adalah?',
                order: 1,
                weightCorrect: 10,
                weightWrong: 0,
            });

            /* =======================
               JAWABAN SOAL
            ======================= */
            await ctx.tx.insert(jawabanSoalTable).values([
                {
                    id: uuidv7(),
                    soalId,
                    value: '10',
                    isCorrect: false,
                    order: 1,
                },
                {
                    id: uuidv7(),
                    soalId,
                    value: '11',
                    isCorrect: false,
                    order: 2,
                },
                {
                    id: uuidv7(),
                    soalId,
                    value: '12',
                    isCorrect: true,
                    order: 3,
                },
                {
                    id: uuidv7(),
                    soalId,
                    value: '13',
                    isCorrect: false,
                    order: 4,
                },
            ]);

            /* =======================
               AGENDA
            ======================= */
            const agendaId = uuidv7();

            await ctx.tx.insert(agendaTable).values({
                id: agendaId,
                title: 'Ujian Tengah Semester',
                date: new Date('2026-03-15 08:00:00'),
                description: 'UTS Semester Genap',
            });

            /* =======================
               JADWAL
            ======================= */
            await ctx.tx.insert(jadwalTable).values({
                id: uuidv7(),
                agendaId,
                paketSoalId,
                startTime: new Date('2026-03-15 08:00:00'),
                endTime: new Date('2026-03-15 09:30:00'),
            });

            /* =======================
               AGENDA ↔ SISWA
            ======================= */
            await ctx.tx.insert(agendaSiswaTable).values({
                id: uuidv7(),
                agendaId,
                siswaId,
            });
        });
    }
}
