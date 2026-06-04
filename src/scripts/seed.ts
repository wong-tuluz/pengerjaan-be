import { auth } from "../modules/auth/auth";
import { db, settingTable, user } from "../common/db";
import { eq } from "drizzle-orm";

async function seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = "System Administrator";

    console.log(`Checking if admin user exists: ${adminEmail}...`);

    const existingUser = await db.select().from(user)
        .where(eq(user.email, adminEmail))
        .limit(1)
        .then(res => res[0]);

    if (existingUser) {
        console.log("Admin user already exists. Updating role to admin...");
        await db.update(user)
            .set({ role: "admin", username: "administrator" })
            .where(eq(user.id, existingUser.id));

        console.log("Admin role updated.");
        return;
    }

    console.log("Creating new admin user...");

    const newUser = await auth.api.signUpEmail({
        body: {
            email: adminEmail,
            password: adminPassword,
            name: adminName,
        }
    });

    if (!newUser) {
        throw new Error("Failed to create admin user");
    }

    await db.update(user)
        .set({ role: "admin", username: "administrator" })
        .where(eq(user.id, newUser.user.id));

    console.log("Admin user created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
}

async function seedSettings() {
    await db.insert(settingTable).values({
        key: "default",
        data: {
            safe_mode: true,
            showHasil: false,
        }
    }).onDuplicateKeyUpdate({
        set: { key: "default" },
    })
}

async function seed() {
    await seedAdmin();
    await seedSettings();
}

seed()
    .catch(err => {
        console.error("Seeding failed:", err);
    })
    .finally(async () => {
        if (db.$client?.end) {
            await db.$client.end();
        }
        process.exit(0);
    });