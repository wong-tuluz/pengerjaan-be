import { betterAuth } from "better-auth";
import { createAuthClient } from "better-auth/client"
import { usernameClient, adminClient } from "better-auth/client/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbAuth } from "../../infra/drizzle/drizzle.providers";
import { admin, username } from "better-auth/plugins"
import * as schema from "../../infra/drizzle/schema";

export const auth = betterAuth({
    database: drizzleAdapter(dbAuth, {
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
    trustedOrigins: async (request) => {
        return [request?.headers.get("origin") ?? ""];
    },
    advanced: {
        disableOriginCheck: true,
    },
    cookie: {
        secure: false,
        sameSite: "lax",
    }
});

export const authClient = createAuthClient({
    plugins: [
        usernameClient(),
        adminClient()
    ]
})