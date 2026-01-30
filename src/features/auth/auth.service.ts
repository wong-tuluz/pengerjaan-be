import { Injectable } from "@nestjs/common";
import { SiswaService } from "../siswa/services/siswa.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly siswaService: SiswaService,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(username: string, pass: string, proktor?: boolean): Promise<any> {
        if (proktor) {
            const user = {
                id: "123",
                username: "Super Proktor",
                proktor: true
            }

            return user
        } else {
            // const user = await this.siswaService.getByUsername(username)
            // if (user && user.passwordHash === pass) {
            //     const { passwordHash, ...result } = user
            //     return result
            // }
        }

        return null
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, proktor: user.proktor ? user.proktor : false };
        return {
            access_token: this.jwtService.sign(payload),
            user: user
        };
    }
}