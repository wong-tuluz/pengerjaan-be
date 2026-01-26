import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/strategies/jwt.guard";
import type { Request } from 'express';
import { JadwalQueryService } from "./jadwal-query.service";
import { AppException } from "../../../infra/exceptions/app-exception";

@Controller('jadwal')
export class JadwalController {
    constructor(
        private readonly jadwalQuery: JadwalQueryService,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getAll(@Req() req: Request) {
        const user = this.validateUser(req);

        return this.jadwalQuery.getAllJadwal(user.proktor ? undefined : user.userId);
    }

    private validateUser(req: Request): { userId: string, proktor: boolean } {
        if (!req.user)
            throw new AppException("User not specified")

        return req.user as { userId: string, proktor: boolean }
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getById(@Param('id') agendaId: string) {
        return await this.jadwalQuery.getById(agendaId)
    }
}