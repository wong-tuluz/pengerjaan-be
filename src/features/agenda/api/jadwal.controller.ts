import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/strategies/jwt.guard";
import type { Request } from 'express';
import { JadwalQueryService } from "../services/jadwal-query.service";
import { AppException } from "../../../infra/exceptions/app-exception";

@Controller('jadwal')
export class JadwalController {
    constructor(
        private readonly jadwalQuery: JadwalQueryService,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAll(@Req() req: Request) {
        const user = req.user
        if (!user) {
            throw new AppException("no user")
        }

        return this.jadwalQuery.getAllJadwal(user.proktor ? undefined : user?.userId);
    }
}