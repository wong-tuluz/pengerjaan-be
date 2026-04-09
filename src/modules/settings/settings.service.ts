import { Injectable } from "@nestjs/common";
import { db, settingTable } from "src/common/db";
import { eq } from "drizzle-orm";

@Injectable()
export class SettingService {
    constructor() { }

    async store<T = any>(data: T, key: string = 'default') {
        await db.delete(settingTable).where(eq(settingTable.key, key));

        await db.insert(settingTable).values({
            key,
            data: data,
        });
    }

    async fetch<T = any>(key: string = 'default'): Promise<T | null> {
        const rows = await db
            .select()
            .from(settingTable)
            .where(eq(settingTable.key, key));

        if (!rows.length) {
            return null;
        }

        const raw = rows[0].data;

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw as string) as T;
        } catch (error) {
            throw new Error(`Invalid JSON stored for setting key: ${key}`);
        }
    }
}