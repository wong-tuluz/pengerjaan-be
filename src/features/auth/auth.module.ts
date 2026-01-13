import { Module } from "@nestjs/common";
import { SiswaModule } from "../siswa/siswa.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JWT_KEY } from "../../config/db.constants";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
    imports: [SiswaModule, PassportModule, JwtModule.register({
        secret: JWT_KEY,
        signOptions: { expiresIn: '60s' },
    }),],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController]
})
export class AuthModule { }