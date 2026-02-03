import { Injectable } from '@nestjs/common';
import { TransactionManager } from '../../infra/drizzle/transaction-manager';
import {
    siswaTable,
    agendaTable,
    agendaSiswaTable,
    jadwalTable,
    paketSoalTable,
    materiSoalTable,
    soalTable,
    jawabanSoalTable,
    user
} from '../../infra/drizzle/schema';
import { v7 as uuidv7, v4 as uuidv4 } from 'uuid';
import { auth, authClient } from '../auth/auth';
import { eq, not } from 'drizzle-orm';

@Injectable()
export class Seeder {
    constructor(private readonly txm: TransactionManager) { }

    async seed() {
        await this.seedProktor()
        await this.seedSiswa()

        const soalId = await this.seedSoal()
        this.seedEvent(soalId)
    }

    private async seedProktor() {
        const user = await authClient.signUp.email({
            username: "superproktor",
            email: "superproktor@acme.com",
            password: "superproktor",
            name: "Super Proktor"
        })

        const ctx = await (auth.$context)
        ctx.internalAdapter.updateUser(user.data!.user.id, {
            role: "admin"
        })
    }

    private async seedSiswa() {
        const userSeeds = ["Agus Pleret", "Budi Santoso"]
        let index = 0

        for (const name of userSeeds) {
            index++

            const res = await authClient.signUp.email({
                username: name.split(' ')[0].toLowerCase(),
                email: name.replaceAll(' ', '').toLowerCase() + "@acme.com",
                password: name.replaceAll(' ', '').toLowerCase(),
                name
            })

            if (!res.data?.user) {
                console.error('Signup failed for', name, res.error)
                continue
            }

            await this.txm.run(async ctx => {
                await ctx.tx.insert(siswaTable).values({
                    id: uuidv4(),
                    accountId: res.data.user.id,
                    nama: name,
                    nis: (20250 + index).toString(),
                    username: name.split(' ')[0],
                    password: name.replaceAll(' ', '').toLowerCase(),
                    kelas: "IX"
                })
            })
        }
    }

    private async seedEvent(paketSoalId: string) {
        await this.txm.run(async ctx => {
            const agendaId = uuidv7();

            await ctx.tx.insert(agendaTable).values({
                id: agendaId,
                title: 'Ujian Tengah Semester',
                startTime: new Date('2026-03-15T08:00:00'),
                endTime: new Date('2026-03-15T09:30:00'),
                description: 'UTS Semester Genap',
            });

            await ctx.tx.insert(jadwalTable).values({
                id: uuidv7(),
                title: 'Matematika',
                agendaId,
                paketSoalId,
                attempts: 1,
                timeLimit: 90,
                token: "ABCD",
                startTime: new Date('2026-03-15T08:00:00'),
                endTime: new Date('2026-03-15T09:30:00'),
            });

            var users = await ctx.tx.select().from(user).where(not(eq(user.role, 'admin')))

            for (const u of users) {
                const siswa = await ctx.tx.select().from(siswaTable).where(eq(siswaTable.accountId, u.id)).then(rows => rows[0])

                // Assign siswa to event
                await ctx.tx.insert(agendaSiswaTable).values([{
                    id: uuidv7(),
                    agendaId,
                    siswaId: siswa.id,
                }]);
            };
        })
    }

    private async seedSoal(): Promise<string> {
        const paketSoalId = uuidv7();

        const materiAljabarId = uuidv7();
        const materiGeometriId = uuidv7();
        const materiAritmatikaId = uuidv7();

        await this.txm.run(async ctx => {
            await ctx.tx.insert(paketSoalTable).values({
                id: paketSoalId,
                title: 'Ujian Matematika Dasar',
                description: 'Ujian untuk mengukur pemahaman dasar matematika',
            });

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
        })

        return paketSoalId
    }
}
