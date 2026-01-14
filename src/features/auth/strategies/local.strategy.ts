import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            passReqToCallback: true,
        });
    }

    async validate(req: Request, username: string, password: string): Promise<any> {
        const asProktor = req.body?.proktor;

        const user = await this.authService.validateUser(username, password, asProktor);
        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}