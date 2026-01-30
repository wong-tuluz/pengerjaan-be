import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { READ_DB, WRITE_DB } from "../../../../common/config/db.constants";
import { agendaSiswaTable, agendaTable } from "../../../../infra/drizzle/schema";
import { and, eq, exists } from "drizzle-orm";
import { Agenda } from "../domain/agenda";

@Injectable()
export class AgendaService {
    constructor(
        @Inject(READ_DB) private readonly rdb: MySql2Database,
        @Inject(WRITE_DB) private readonly db: MySql2Database
    ) { }

    async listAll(filter?: { siswaId?: string }): Promise<Agenda[]> {
        const rows = await this.rdb.select()
            .from(agendaTable)
            .where(and(...[
                filter?.siswaId ? exists(
                    this.rdb.select().from(agendaSiswaTable)
                        .where(and(
                            eq(agendaSiswaTable.siswaId, filter.siswaId),
                            eq(agendaSiswaTable.agendaId, agendaTable.id),
                        )),
                ) : undefined
            ]))

        return rows.map(row => new Agenda(row))
    }

    async findById(agendaId: string): Promise<Agenda> {
        const row = await this.rdb.select().from(agendaTable)
            .where(eq(agendaTable.id, agendaId))
            .then(rows => rows[0])

        if (!row) throw new NotFoundException();

        return new Agenda(row)
    }

    async listSiswa(agendaId: string) {
        const row = await this.rdb.select().from(agendaSiswaTable)
            .where(eq(agendaSiswaTable.agendaId, agendaId))

        return row
    }
}