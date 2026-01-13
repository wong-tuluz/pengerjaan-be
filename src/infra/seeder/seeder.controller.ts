import { Controller, Post } from "@nestjs/common";
import { Seeder } from "./seeder";

@Controller('seed')
export class SeederController {
    constructor(
        private readonly seederService: Seeder
    ) { }

    @Post()
    async seed() {
        return this.seederService.seed();
    }
}