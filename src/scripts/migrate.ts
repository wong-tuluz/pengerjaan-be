import 'dotenv/config';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';

async function runMigrations() {
    console.log('Running migrations...');

    const db = drizzle(process.env.DATABASE_URL!);

    try {
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('Migrations completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

runMigrations();