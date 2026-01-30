import { betterAuth } from "better-auth";
import { createAuthClient } from "better-auth/client"
import { usernameClient, adminClient } from "better-auth/client/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbAuth } from "../../infra/drizzle/drizzle.providers";
import { admin, jwt, username } from "better-auth/plugins"
import * as schema from "../../infra/drizzle/schema";

export const auth = betterAuth({
    database: drizzleAdapter(dbAuth, {
        provider: "mysql",
        schema
    }),
    advanced: {
        disableOriginCheck: true,
    },
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username(),
        admin(),
    ],
});

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        usernameClient(),
        adminClient()
    ]
})