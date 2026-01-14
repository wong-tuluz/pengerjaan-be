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
import { v7 as uuidv7, v4 as uuidv4 } from 'uuid';

@Injectable()
export class Seeder {
    constructor(private readonly txm: TransactionManager) { }

    async seed() {
        await this.txm.run(async (ctx) => {

            /* =======================
               SISWA
            ======================= */
            const siswaIds = [
                uuidv4(),
                uuidv4()
            ];

            await ctx.tx.insert(siswaTable).values({
                id: siswaIds[0],
                nama: 'Budi Santoso',
                nis: '2024001',
                kelas: 'X-A',
                username: 'budi',
                passwordHash: 'budisantoso',
            });

            await ctx.tx.insert(siswaTable).values({
                id: siswaIds[1],
                nama: 'Agus Pleret',
                nis: '2024002',
                kelas: 'X-A',
                username: 'agus',
                passwordHash: 'aguspleret',
            });

            /* =======================
               PAKET SOAL
            ======================= */
            const paketSoalId = uuidv7();

            await ctx.tx.insert(paketSoalTable).values({
                id: paketSoalId,
                title: 'Ujian Matematika Dasar',
                description: 'Ujian untuk mengukur pemahaman dasar matematika',
            });

            /* =======================
               MATERI SOAL
            ======================= */
            const materiAljabarId = uuidv7();
            const materiGeometriId = uuidv7();
            const materiAritmatikaId = uuidv7();

            await ctx.tx.insert(materiSoalTable).values([
                {
                    id: materiAljabarId,
                    paketSoalId,
                    title: 'Aljabar Dasar',
                    description: 'Penjumlahan dan pengurangan',
                    order: 1,
                    timeLimit: 30,
                },
                {
                    id: materiGeometriId,
                    paketSoalId,
                    title: 'Geometri Dasar',
                    description: 'Keliling dan luas bangun datar',
                    order: 2,
                    timeLimit: 30,
                },
                {
                    id: materiAritmatikaId,
                    paketSoalId,
                    title: 'Aritmatika',
                    description: 'Operasi bilangan bulat',
                    order: 3,
                    timeLimit: 30,
                },
            ]);

            /* =======================
               HELPER: INSERT SOAL MC
            ======================= */
            const insertMC = async (
                materiSoalId: string,
                order: number,
                prompt: string,
                correct: string,
                options: string[],
            ) => {
                const soalId = uuidv7();

                await ctx.tx.insert(soalTable).values({
                    id: soalId,
                    materiSoalId,
                    type: 'multiple-choice',
                    prompt,
                    order,
                    weightCorrect: 10,
                    weightWrong: 0,
                });

                await ctx.tx.insert(jawabanSoalTable).values(
                    options.map((value, index) => ({
                        id: uuidv7(),
                        soalId,
                        value,
                        isCorrect: value === correct,
                        order: index + 1,
                    })),
                );
            };

            /* =======================
               SOAL – ALJABAR
            ======================= */
            await insertMC(
                materiAljabarId,
                1,
                'Hasil dari 5 + 7 adalah?',
                '12',
                ['10', '11', '12', '13'],
            );

            await insertMC(
                materiAljabarId,
                2,
                'Hasil dari 15 - 8 adalah?',
                '7',
                ['5', '6', '7', '8'],
            );

            await insertMC(
                materiAljabarId,
                3,
                'Nilai x dari x + 4 = 10 adalah?',
                '6',
                ['4', '5', '6', '7'],
            );

            /* =======================
               SOAL – GEOMETRI
            ======================= */
            await insertMC(
                materiGeometriId,
                1,
                'Keliling persegi dengan sisi 4 cm adalah?',
                '16',
                ['8', '12', '16', '20'],
            );

            await insertMC(
                materiGeometriId,
                2,
                'Luas persegi panjang 5 × 3 adalah?',
                '15',
                ['8', '10', '15', '20'],
            );

            /* =======================
               SOAL – ARITMATIKA
            ======================= */
            await insertMC(
                materiAritmatikaId,
                1,
                'Hasil dari 6 × 7 adalah?',
                '42',
                ['36', '40', '42', '48'],
            );

            await insertMC(
                materiAritmatikaId,
                2,
                'Hasil dari 20 ÷ 4 adalah?',
                '5',
                ['4', '5', '6', '8'],
            );

            await insertMC(
                materiAritmatikaId,
                3,
                'Hasil dari 9 + 6 ÷ 3 adalah?',
                '11',
                ['5', '7', '11', '15'],
            );

            /* =======================
               AGENDA
            ======================= */
            const agendaId = uuidv7();

            await ctx.tx.insert(agendaTable).values({
                id: agendaId,
                title: 'Ujian Tengah Semester',
                startTime: new Date('2026-03-15T08:00:00'),
                endTime: new Date('2026-03-15T09:30:00'),
                description: 'UTS Semester Genap',
            });

            /* =======================
               JADWAL
            ======================= */
            await ctx.tx.insert(jadwalTable).values({
                id: uuidv7(),
                agendaId,
                paketSoalId,
                attempts: 1,
                timeLimit: 90,
                startTime: new Date('2026-03-15T08:00:00'),
                endTime: new Date('2026-03-15T09:30:00'),

            });

            /* =======================
               AGENDA ↔ SISWA
            ======================= */
            await ctx.tx.insert(agendaSiswaTable).values([{
                id: uuidv7(),
                agendaId,
                siswaId: siswaIds[0],
            }, {
                id: uuidv7(),
                agendaId,
                siswaId: siswaIds[1],
            }]);
        });
    }
}
