import { Injectable, NotFoundException } from "@nestjs/common";
import { db, DbTransaction, siswaTable, agendaSiswaTable, user as userTable } from "src/common/db";
import { eq, and, exists, or, count, asc } from "drizzle-orm";
import { auth } from "../auth/auth";

@Injectable()
export class SiswaService {
    constructor() { }

    async listAll(filter?: { kelas?: string, agendaId?: string }, pagination?: { limit?: number, offset?: number }) {
        const filters: any[] = [];
        if (filter?.kelas) filters.push(eq(siswaTable.kelas, filter.kelas));
        if (filter?.agendaId) {
            filters.push(exists(
                db.select().from(agendaSiswaTable)
                    .where(and(
                        eq(agendaSiswaTable.siswaId, siswaTable.id),
                        eq(agendaSiswaTable.agendaId, filter.agendaId),
                    )),
            ));
        }

        const whereClause = filters.length > 0 ? and(...filters) : undefined;

        const rows = await db.select()
            .from(siswaTable)
            .where(whereClause)
            .limit(pagination?.limit ?? 100)
            .offset(pagination?.offset ?? 0)
            .orderBy(asc(siswaTable.nama));

        const totalResult = await db.select({ count: count() })
            .from(siswaTable)
            .where(whereClause);

        const totalRows = totalResult[0]?.count ?? 0;

        return { rows, metadata: { count: totalRows } };
    }

    async findById(id: string) {
        const result = await db.select()
            .from(siswaTable)
            .where(eq(siswaTable.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!result) throw new NotFoundException();
        return result;
    }

    async findByAccount(accountId: string) {
        const result = await db.select()
            .from(siswaTable)
            .where(eq(siswaTable.accountId, accountId))
            .limit(1)
            .then((res) => res[0]);

        if (!result) throw new NotFoundException();
        return result;
    }

    async findByUsername(username: string) {
        const result = await db.select()
            .from(siswaTable)
            .where(eq(siswaTable.username, username))
            .limit(1)
            .then((res) => res[0]);

        return result;
    }

    async setPassword(siswaId: string, password: string) {
        const siswa = await this.findById(siswaId);

        const ctx = await (auth.$context);
        const hashedPassword = await ctx.password.hash(password);
        await ctx.internalAdapter.updatePassword(siswa.accountId!, hashedPassword);

        await db.update(siswaTable)
            .set({ password })
            .where(eq(siswaTable.id, siswaId));
    }

    async createAccount(tx: DbTransaction, siswaId: string) {
        const siswa = await tx.select()
            .from(siswaTable)
            .where(eq(siswaTable.id, siswaId))
            .limit(1)
            .then((res) => res[0]);

        const email = siswa.username.toLowerCase() + "@acme.com";

        const existingUser = await tx.select()
            .from(userTable)
            .where(or(
                eq(userTable.email, email),
                eq(userTable.username, siswa.username)
            ))
            .limit(1)
            .then(res => res[0]);

        let accountId: string;

        if (existingUser) {
            accountId = existingUser.id;
        } else {
            const res = await auth.api.signUpEmail({
                body: {
                    name: siswa.nama,
                    email: email,
                    password: siswa.password,
                }
            })

            await tx.update(userTable)
                .set({
                    username: siswa.username,
                })
                .where(eq(userTable.id, res.user.id));

            accountId = res.user.id;
        }

        await this.save(tx, { ...siswa, accountId });
        return { ...siswa, accountId };
    }

    async create(data: {
        nis: string;
        name: string;
        birthDate: Date;
        kelas: string;
        username: string;
        password: string;
    }) {
        const existing = await this.findByUsername(data.username);
        if (existing) {
            if (existing.accountId && existing.password !== data.password) {
                await this.setPassword(existing.id, data.password);
            }
            return existing;
        }

        return await db.transaction(async (tx) => {
            const id = crypto.randomUUID();
            const siswa = {
                id,
                nis: data.nis,
                nama: data.name, // Mapping 'name' to 'nama'
                kelas: data.kelas,
                username: data.username,
                password: data.password,
                birthDate: data.birthDate,
            };

            await this.save(tx as any, siswa);
            return await this.createAccount(tx as any, id);
        });
    }

    async save(tx: DbTransaction, data: {
        id?: string;
        accountId?: string;
        nis: string;
        nama: string;
        kelas: string;
        username: string;
        password: string;
        birthDate?: Date;
    }) {
        const id = data.id ?? crypto.randomUUID();

        const properties = {
            accountId: data.accountId,
            nama: data.nama,
            nis: data.nis,
            kelas: data.kelas,
            username: data.username,
            password: data.password,
            birthDate: data.birthDate,
            updatedAt: new Date(),
        }

        await tx.insert(siswaTable).values({
            id,
            ...properties,
            createdAt: new Date(),
        }).onDuplicateKeyUpdate({
            set: {
                ...properties,
            }
        })
    }
}