import { Injectable } from "@nestjs/common";
import { SiswaQueryService } from "../siswa/services/siswa-query.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly siswaService: SiswaQueryService,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.siswaService.getByUsername(username)
        if (user && user.passwordHash === pass) {
            const { passwordHash, ...result } = user
            return result
        }

        return null
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: user
        };
    }
}