import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbAuth } from "../../infra/drizzle/drizzle.providers";
import { admin, anonymous, organization, jwt, openAPI } from "better-auth/plugins"
import * as schema from "../../infra/drizzle/schema";

export const auth = betterAuth({
    database: drizzleAdapter(dbAuth, {
        provider: "pg",
        schema
    }),
    advanced: {
        disableOriginCheck: true,
    },

    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        anonymous(),
        admin(),
        organization(),
        jwt(),
        openAPI(),
    ],
});