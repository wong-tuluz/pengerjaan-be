import { betterAuth } from "better-auth";
import { createAuthClient } from "better-auth/client"
import { usernameClient, adminClient } from "better-auth/client/plugins"
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins"
import * as schema from "../../common/db/schema";
import { db } from "../../common/db/drizzle";
import { redisInstance as redis } from "../redis/redis.provider";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 1
    },
    plugins: [
        username(),
        admin(),
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 1,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
            strategy: 'jwt'
        }
    },
    secondaryStorage: {
        get: async (key) => await redis.get(key),
        set: async (key, value, ttl) => {
            if (ttl) {
                await redis.set(key, value, "EX", ttl as number);
            } else {
                await redis.set(key, value);
            }
        },
        delete: async (key) => {
            await redis.del(key);
            return;
        }
    },
    trustedOrigins: [
        "https://cbt-mupa.antz.biz.id",
        "https://api-cbt-mupa.antz.biz.id",
        "https://antz.biz.id",
        "http://localhost:5173",
        "https://localhost"
    ],
    disableTrustedOriginsCors: false,
    advanced: {
        crossSubDomainCookies: {
            enabled: false,
            domain: "antz.biz.id",
        },
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: true,
        }
    },
});

export const authClient = createAuthClient({
    plugins: [
        usernameClient(),
        adminClient()
    ]
})