import { Controller, Post } from "@nestjs/common";
import { Seeder } from "./seeder";
import { Session, UserSession, AllowAnonymous, OptionalAuth } from '@thallesp/nestjs-better-auth';

@Controller('seed')
export class SeederController {
    constructor(
        private readonly seederService: Seeder
    ) { }

    @Post()
    @AllowAnonymous()
    async seed() {
        return this.seederService.seed();
    }
}