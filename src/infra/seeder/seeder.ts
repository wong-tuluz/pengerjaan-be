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
                uuidv4(),
                uuidv4(),
                uuidv4(),
                uuidv4()
            ];

            await ctx.tx.insert(siswaTable).values([
                {
                    id: siswaIds[0],
                    nama: 'Budi Santoso',
                    nis: '2024001',
                    kelas: 'X-A',
                    username: 'budi',
                    passwordHash: 'budisantoso',
                },
                {
                    id: siswaIds[1],
                    nama: 'Agus Pleret',
                    nis: '2024002',
                    kelas: 'X-A',
                    username: 'agus',
                    passwordHash: 'aguspleret',
                },
                {
                    id: siswaIds[2],
                    nama: 'Citra Dewi',
                    nis: '2024003',
                    kelas: 'X-A',
                    username: 'citra',
                    passwordHash: 'citradewi',
                },
                {
                    id: siswaIds[3],
                    nama: 'Dedi Setiawan',
                    nis: '2024004',
                    kelas: 'X-B',
                    username: 'dedi',
                    passwordHash: 'dedisetiawan',
                },
                {
                    id: siswaIds[4],
                    nama: 'Eka Putri',
                    nis: '2024005',
                    kelas: 'X-B',
                    username: 'eka',
                    passwordHash: 'ekaputri',
                }
            ]);

            /* =======================
               PAKET SOAL
            ======================= */
            const paketMatematikaId = uuidv7();
            const paketBahasaId = uuidv7();

            await ctx.tx.insert(paketSoalTable).values([
                {
                    id: paketMatematikaId,
                    title: 'Ujian Matematika Dasar',
                    description: 'Ujian untuk mengukur pemahaman dasar matematika',
                },
                {
                    id: paketBahasaId,
                    title: 'Tes Bahasa Indonesia',
                    description: 'Menguji kemampuan membaca dan menulis',
                }
            ]);

            /* =======================
               MATERI SOAL - MATEMATIKA
            ======================= */
            const materiAljabarId = uuidv7();
            const materiGeometriId = uuidv7();
            const materiAritmatikaId = uuidv7();

            await ctx.tx.insert(materiSoalTable).values([
                {
                    id: materiAljabarId,
                    paketSoalId: paketMatematikaId,
                    title: 'Aljabar Dasar',
                    description: 'Penjumlahan dan pengurangan',
                    order: 1,
                    timeLimit: 30,
                },
                {
                    id: materiGeometriId,
                    paketSoalId: paketMatematikaId,
                    title: 'Geometri Dasar',
                    description: 'Keliling dan luas bangun datar',
                    order: 2,
                    timeLimit: 30,
                },
                {
                    id: materiAritmatikaId,
                    paketSoalId: paketMatematikaId,
                    title: 'Aritmatika',
                    description: 'Operasi bilangan bulat',
                    order: 3,
                    timeLimit: 30,
                },
            ]);

            /* =======================
               MATERI SOAL - BAHASA
            ======================= */
            const materiMembacaId = uuidv7();
            const materiMenulisId = uuidv7();

            await ctx.tx.insert(materiSoalTable).values([
                {
                    id: materiMembacaId,
                    paketSoalId: paketBahasaId,
                    title: 'Pemahaman Membaca',
                    description: 'Menguji kemampuan memahami teks',
                    order: 1,
                    timeLimit: 25,
                },
                {
                    id: materiMenulisId,
                    paketSoalId: paketBahasaId,
                    title: 'Keterampilan Menulis',
                    description: 'Tata bahasa dan ejaan',
                    order: 2,
                    timeLimit: 35,
                }
            ]);

            /* =======================
               HELPER: INSERT SOAL
            ======================= */
            const insertSoal = async (
                materiSoalId: string,
                order: number,
                type: 'single-choice' | 'multiple-choice',
                prompt: string,
                correctAnswers: string[],
                allOptions: string[],
            ) => {
                const soalId = uuidv7();

                await ctx.tx.insert(soalTable).values({
                    id: soalId,
                    materiSoalId,
                    type,
                    prompt,
                    order,
                    weightCorrect: 10,
                    weightWrong: 0,
                });

                await ctx.tx.insert(jawabanSoalTable).values(
                    allOptions.map((value, index) => ({
                        id: uuidv7(),
                        soalId,
                        value,
                        isCorrect: correctAnswers.includes(value),
                        order: index + 1,
                    })),
                );
            };

            /* =======================
               SOAL – ALJABAR (single-choice)
            ======================= */
            await insertSoal(
                materiAljabarId,
                1,
                'single-choice',
                'Hasil dari 5 + 7 adalah?',
                ['12'],
                ['10', '11', '12', '13'],
            );

            await insertSoal(
                materiAljabarId,
                2,
                'single-choice',
                'Hasil dari 15 - 8 adalah?',
                ['7'],
                ['5', '6', '7', '8'],
            );

            await insertSoal(
                materiAljabarId,
                3,
                'single-choice',
                'Nilai x dari x + 4 = 10 adalah?',
                ['6'],
                ['4', '5', '6', '7'],
            );

            /* =======================
               SOAL – GEOMETRI (single-choice)
            ======================= */
            await insertSoal(
                materiGeometriId,
                1,
                'single-choice',
                'Keliling persegi dengan sisi 4 cm adalah?',
                ['16 cm'],
                ['8 cm', '12 cm', '16 cm', '20 cm'],
            );

            await insertSoal(
                materiGeometriId,
                2,
                'single-choice',
                'Luas persegi panjang 5 × 3 adalah?',
                ['15 cm²'],
                ['8 cm²', '10 cm²', '15 cm²', '20 cm²'],
            );

            /* =======================
               SOAL – ARITMATIKA (multiple-choice)
            ======================= */
            await insertSoal(
                materiAritmatikaId,
                1,
                'multiple-choice',
                'Pilih bilangan prima:',
                ['2', '3', '5'],
                ['1', '2', '3', '4', '5', '6'],
            );

            await insertSoal(
                materiAritmatikaId,
                2,
                'multiple-choice',
                'Operasi yang hasilnya 10:',
                ['5 + 5', '20 ÷ 2'],
                ['3 + 7', '5 + 5', '12 - 3', '20 ÷ 2'],
            );

            await insertSoal(
                materiAritmatikaId,
                3,
                'single-choice',
                'Hasil dari 9 + 6 ÷ 3 adalah?',
                ['11'],
                ['5', '7', '11', '15'],
            );

            /* =======================
               SOAL – MEMBACA (single-choice)
            ======================= */
            await insertSoal(
                materiMembacaId,
                1,
                'single-choice',
                'Sinonim dari kata "pandai" adalah?',
                ['cerdas'],
                ['bodoh', 'cerdas', 'malas', 'rajin'],
            );

            await insertSoal(
                materiMembacaId,
                2,
                'single-choice',
                'Antonim dari kata "tinggi" adalah?',
                ['rendah'],
                ['pendek', 'rendah', 'datar', 'landai'],
            );

            /* =======================
               SOAL – MENULIS (multiple-choice)
            ======================= */
            await insertSoal(
                materiMenulisId,
                1,
                'multiple-choice',
                'Pilih kata yang penulisannya benar:',
                ['telepon', 'apotek'],
                ['telpon', 'telepon', 'apotik', 'apotek'],
            );

            await insertSoal(
                materiMenulisId,
                2,
                'single-choice',
                'Penulisan alamat email yang benar adalah?',
                ['nama@domain.com'],
                ['nama@domain', 'nama.domain.com', 'nama@domain.com', '@nama.domain'],
            );

            /* =======================
               AGENDA
            ======================= */
            const agendaUTSId = uuidv7();
            const agendaTryoutId = uuidv7();

            await ctx.tx.insert(agendaTable).values([
                {
                    id: agendaUTSId,
                    title: 'Ujian Tengah Semester',
                    startTime: new Date('2026-03-15T08:00:00'),
                    endTime: new Date('2026-03-15T09:30:00'),
                    description: 'UTS Semester Genap',
                },
                {
                    id: agendaTryoutId,
                    title: 'Tryout UAS',
                    startTime: new Date('2026-04-10T08:00:00'),
                    endTime: new Date('2026-04-10T10:00:00'),
                    description: 'Tryout persiapan UAS',
                }
            ]);

            /* =======================
               JADWAL
            ======================= */
            await ctx.tx.insert(jadwalTable).values([
                {
                    id: uuidv7(),
                    agendaId: agendaUTSId,
                    paketSoalId: paketMatematikaId,
                    attempts: 1,
                    timeLimit: 90,
                    startTime: new Date('2026-03-15T08:00:00'),
                    endTime: new Date('2026-03-15T09:30:00'),
                },
                {
                    id: uuidv7(),
                    agendaId: agendaTryoutId,
                    paketSoalId: paketBahasaId,
                    attempts: 2,
                    timeLimit: 90,
                    startTime: new Date('2026-04-10T08:00:00'),
                    endTime: new Date('2026-04-10T09:30:00'),
                }
            ]);

            /* =======================
               AGENDA ↔ SISWA
            ======================= */
            await ctx.tx.insert(agendaSiswaTable).values([
                // Agenda UTS untuk semua siswa
                {
                    id: uuidv7(),
                    agendaId: agendaUTSId,
                    siswaId: siswaIds[0],
                },
                {
                    id: uuidv7(),
                    agendaId: agendaUTSId,
                    siswaId: siswaIds[1],
                },
                {
                    id: uuidv7(),
                    agendaId: agendaUTSId,
                    siswaId: siswaIds[2],
                },
                {
                    id: uuidv7(),
                    agendaId: agendaUTSId,
                    siswaId: siswaIds[3],
                },
                {
                    id: uuidv7(),
                    agendaId: agendaUTSId,
                    siswaId: siswaIds[4],
                },
                // Agenda Tryout hanya untuk 3 siswa
                {
                    id: uuidv7(),
                    agendaId: agendaTryoutId,
                    siswaId: siswaIds[0],
                },
                {
                    id: uuidv7(),
                    agendaId: agendaTryoutId,
                    siswaId: siswaIds[1],
                },
                {
                    id: uuidv7(),
                    agendaId: agendaTryoutId,
                    siswaId: siswaIds[2],
                }
            ]);
        });
    }
}