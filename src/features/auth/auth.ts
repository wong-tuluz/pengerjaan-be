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
    trustedOrigins: [
        "https://localhost:*/**",
        "http://localhost:*/**"
    ],
});

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        usernameClient(),
        adminClient()
    ]
})