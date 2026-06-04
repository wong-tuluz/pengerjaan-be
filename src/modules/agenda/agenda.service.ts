import { Injectable, NotFoundException } from "@nestjs/common";
import { db, agendaSiswaTable, agendaTable } from "src/common/db";
import { and, eq, exists } from "drizzle-orm";

@Injectable()
export class AgendaService {
    constructor() { }

    async listAll(filter?: { siswaId?: string }) {
        const rows = await db.select()
            .from(agendaTable)
            .where(and(...[
                filter?.siswaId ? exists(
                    db.select().from(agendaSiswaTable)
                        .where(and(
                            eq(agendaSiswaTable.siswaId, filter.siswaId),
                            eq(agendaSiswaTable.agendaId, agendaTable.id),
                        )),
                ) : undefined
            ]))

        return rows;
    }

    async findById(agendaId: string) {
        const row = await db.select().from(agendaTable)
            .where(eq(agendaTable.id, agendaId))
            .limit(1)
            .then(rows => rows[0]);

        if (!row) throw new NotFoundException();

        return row;
    }

    async listSiswa(agendaId: string) {
        const rows = await db.select().from(agendaSiswaTable)
            .where(eq(agendaSiswaTable.agendaId, agendaId))

        return rows;
    }

    async save(data: {
        id?: string;
        title: string;
        startTime: Date;
        endTime: Date;
        description?: string;
        remoteId?: string;
    }) {
        const id = data.id ?? crypto.randomUUID();
        const payload = {
            id,
            remoteId: data.remoteId,
            title: data.title,
            description: data.description || '',
            startTime: data.startTime,
            endTime: data.endTime,
        };

        await db.insert(agendaTable).values(payload).onDuplicateKeyUpdate({
            set: {
                remoteId: payload.remoteId,
                title: payload.title,
                description: payload.description,
                startTime: payload.startTime,
                endTime: payload.endTime,
                updatedAt: new Date(),
            }
        });

        return payload;
    }

    async addSiswa(agendaId: string, siswaId: string, remoteId?: string, id?: string) {
        await db.insert(agendaSiswaTable).values({
            id: id ?? crypto.randomUUID(),
            agendaId,
            siswaId,
            remoteId,
        }).onDuplicateKeyUpdate({
            set: { agendaId, siswaId, remoteId, updatedAt: new Date() },
        });
    }
}