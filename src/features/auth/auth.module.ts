import { Module } from "@nestjs/common";
import { SiswaModule } from "../siswa/siswa.module";
import { JwtModule } from "@nestjs/jwt";
import { JWT_KEY } from "../../common/config/db.constants";
import { AuthModule as AuthenticationModule } from "@thallesp/nestjs-better-auth"
import { auth } from "./auth";

@Module({
    imports: [SiswaModule,
        JwtModule.register({
            secret: JWT_KEY,
            signOptions: { expiresIn: '60s' },
        }),
        AuthenticationModule.forRoot({ auth }),
    ],
})
export class AuthModule { }