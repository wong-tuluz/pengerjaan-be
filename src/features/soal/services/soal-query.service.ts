import { Inject, Injectable } from '@nestjs/common';
import { READ_DB } from '../../../config/db.constants';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { soalTable, jawabanSoalTable } from '../../../infra/drizzle/schema';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class SoalQueryService {
    constructor(@Inject(READ_DB) private readonly db: MySql2Database) {}

    async getByMateriSoalId(materiSoalId: string): Promise<
        {
            id: string;
            materiSoalId: string;
            type: 'multiple-choice' | 'essay' | 'complex-choice';
            prompt: string;
            order: number;
            weightCorrect: number;
            weightWrong: number;
            createdAt: Date;
            updatedAt: Date | null;
        }[]
    > {
        return this.db
            .select()
            .from(soalTable)
            .where(eq(soalTable.materiSoalId, materiSoalId))
            .orderBy(asc(soalTable.order));
    }

    async getById(id: string): Promise<{
        id: string;
        materiSoalId: string;
        type: 'multiple-choice' | 'essay' | 'complex-choice';
        prompt: string;
        order: number;
        weightCorrect: number;
        weightWrong: number;
        createdAt: Date;
        updatedAt: Date | null;
    } | null> {
        const rows = await this.db
            .select()
            .from(soalTable)
            .where(eq(soalTable.id, id))
            .limit(1);

        return rows[0] ?? null;
    }

    async getWithJawaban(soalId: string): Promise<
        | ({
              id: string;
              materiSoalId: string;
              type: 'multiple-choice' | 'essay' | 'complex-choice';
              prompt: string;
              order: number;
              weightCorrect: number;
              weightWrong: number;
              createdAt: Date;
              updatedAt: Date | null;
          } & {
              jawaban: {
                  id: string;
                  soalId: string;
                  value: string;
                  isCorrect: boolean;
                  order: number;
                  createdAt: Date;
                  updatedAt: Date | null;
              }[];
          })
        | null
    > {
        const rows = await this.db
            .select({
                soal: soalTable,
                jawaban: jawabanSoalTable,
            })
            .from(soalTable)
            .leftJoin(
                jawabanSoalTable,
                eq(jawabanSoalTable.soalId, soalTable.id),
            )
            .where(eq(soalTable.id, soalId))
            .orderBy(asc(jawabanSoalTable.order));

        if (rows.length === 0) return null;

        return {
            ...rows[0].soal,
            jawaban: rows
                .filter((r) => r.jawaban !== null)
                .map((r) => r.jawaban!),
        };
    }

        async getJawaban(questionId: string): Promise<
        {
            id: string;
            soalId: string;
            value: string;
            isCorrect: boolean;
            order: number;
            createdAt: Date;
            updatedAt: Date | null;
        }[]
    > {
        const rows = await this.db
            .select()
            .from(jawabanSoalTable)
            .where(eq(jawabanSoalTable.soalId, questionId));

        return rows;
    }
}
