import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { READ_DB, WRITE_DB } from "../../../../common/config/db.constants";
import { workSessionTable } from "../../../../infra/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { Session, SessionStatus } from "../domain/session";
import { JadwalService } from "../../../event/jadwal/services/jadwal.service";

export class SessionService {
    constructor(
        @Inject(READ_DB) private readonly rdb: MySql2Database,
        @Inject(WRITE_DB) private readonly db: MySql2Database,
        private readonly jadwalService: JadwalService
    ) { }

    async hasAccess(sessionId: string, siswaId: string) {
        const session = await this.findById(sessionId)
        if (session.siswaId != siswaId)
            throw new BadRequestException("Tidak ada akses")
    }

    async listAll(filter?: {
        siswaId?: string,
        jadwalId?: string,
        status?: SessionStatus
    }): Promise<Session[]> {
        const qFilter = [
            filter?.siswaId ? eq(workSessionTable.siswaId, filter.siswaId) : undefined,
            filter?.jadwalId ? eq(workSessionTable.jadwalId, filter.jadwalId) : undefined,
            filter?.status ? eq(workSessionTable.status, filter.status) : undefined
        ]

        const rows = await this.rdb.select()
            .from(workSessionTable)
            .where(and(...qFilter))
            .then(rows => rows.map(row => new Session(row)))

        return rows;
    }

    async findById(sessionId: string): Promise<Session> {
        const row = await this.rdb.select()
            .from(workSessionTable)
            .where(eq(workSessionTable.id, sessionId))
            .then(rows => rows[0] ?? null)

        if (!row) throw new NotFoundException();

        return new Session(row);
    }

    async create(siswaId: string, jadwalId: string, token: string) {
        const jadwal = await this.jadwalService.findById(jadwalId);
        const timeLimit = jadwal.getTimeLimit(new Date())

        console.log(timeLimit)

        const session = Session.create(siswaId, jadwalId, jadwal.paketSoalId, null, timeLimit)
        await this.upsert(session)
        return session;
    }

    async finish(sessionId: string) {
        const session = await this.findById(sessionId);

        session.finish()
        await this.upsert(session)
    }

    async reset(sessionId: string) {
        const session = await this.findById(sessionId);

        session.reset()
        await this.upsert(session)
    }

    private async upsert(session: Session) {
        await this.db
            .insert(workSessionTable)
            .values(session)
            .onDuplicateKeyUpdate({
                set: {
                    siswaId: session.siswaId,
                    jadwalId: session.jadwalId,
                    paketSoalId: session.paketSoalId,
                    timeLimit: session.timeLimit,
                    status: session.status,
                    updatedAt: new Date()
                }
            });
    }
}