import { READ_DB, WRITE_DB } from "@/core/constants/db.constants";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { QuestionGroup } from "../domain/question.entity";
import { questionGroups } from "@/modules/drizzle/schema";
import { eq } from "drizzle-orm"
import { UnitOfWork } from "@/core/uow/uow";

@Injectable()
export class QuestionGroupRepository {
    constructor(
        @Inject(READ_DB) private readonly readDb: MySql2Database,
        @Inject(WRITE_DB) private readonly writeDb: MySql2Database
    ) { }

    async find(): Promise<QuestionGroup[]> {
        const rows = await this.readDb
            .select()
            .from(questionGroups)
            .execute();

        return rows.map((row) => {
            const group = new QuestionGroup();

            group.map(row);

            return group;
        });
    }

    async findById(id: string): Promise<QuestionGroup | null> {
        const rows = await this.readDb
            .select()
            .from(questionGroups)
            .where(eq(questionGroups.id, id))
            .limit(1)
            .execute();

        if (rows.length === 0) {
            return null;
        }

        const group = new QuestionGroup();
        group.map(rows[0]);

        return group;
    }

    async upsert(group: QuestionGroup) {
        await this.writeDb
            .insert(questionGroups)
            .values(group)
            .onDuplicateKeyUpdate({
                set: {
                    name: group.name,
                    description: group.description
                },
            });
    }

    async delete(uow: UnitOfWork, id: string) {
        await uow.tx.delete(questionGroups).where(eq(questionGroups.id, id))
    }
}