import { betterAuth } from "better-auth";
import { createAuthClient } from "better-auth/client"
import { usernameClient, adminClient } from "better-auth/client/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins"
import * as schema from "../../common/db/schema";
import { db } from "../../common/db/drizzle";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username(),
        admin(),
    ],
    trustedOrigins: ["*"],
    disableTrustedOriginsCors: true,
    cookie: {
        secure: true,
        sameSite: "lax",
        domain: ".antz.biz.id"
    }
});

export const authClient = createAuthClient({
    plugins: [
        usernameClient(),
        adminClient()
    ]
})