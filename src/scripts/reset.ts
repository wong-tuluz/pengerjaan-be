import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';

async function reset() {
    console.log('--- Database RESET (NUCLEAR) ---');

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not defined');
        process.exit(1);
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);

    try {
        console.log('Disabling foreign key checks...');
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

        const [rows] = await connection.query<any[]>(
            `SELECT table_name 
             FROM information_schema.tables 
             WHERE table_schema = DATABASE()`
        );

        const tables = rows.map((row) => row.TABLE_NAME || row.table_name);

        if (tables.length === 0) {
            console.log('No tables found.');
        } else {
            console.log(`Dropping ${tables.length} tables...`);

            for (const table of tables) {
                console.log(`Dropping table: ${table}`);
                await db.execute(sql.raw(`DROP TABLE \`${table}\``));
            }
        }

        console.log('Enabling foreign key checks...');
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

        console.log('--- RESET COMPLETE ---');
    } catch (error) {
        console.error('Reset failed:', error);
        try {
            await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
        } catch { }
        process.exit(1);
    } finally {
        await connection.end();
    }
}

reset();