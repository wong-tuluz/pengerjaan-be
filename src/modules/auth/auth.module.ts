import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JWT_KEY } from "../../common/config/db.constants";
import { AuthModule as AuthenticationModule } from "@thallesp/nestjs-better-auth"
import { auth } from "./auth";

@Module({
    imports: [
        JwtModule.register({
            secret: JWT_KEY,
            signOptions: { expiresIn: '60s' },
        }),
        AuthenticationModule.forRoot({ auth }),
    ],
})
export class AuthModule { }