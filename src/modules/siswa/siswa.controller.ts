import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    ParseIntPipe,
    UnauthorizedException,
} from '@nestjs/common';
import { SiswaService } from './siswa.service';
import { db } from 'src/common/db';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session, } from '@thallesp/nestjs-better-auth'
import { createZodDto } from "nestjs-zod";
import z from "zod";

const siswaSetPasswordSchema = z.object({
    password: z.string()
})

export class SiswaSetPasswordDto extends createZodDto(siswaSetPasswordSchema) { }

@Controller()
export class ProfileController {
    constructor(private readonly siswaService: SiswaService) { }

    @Get('me')
    async fetchProfile(@Session() session: UserSession) {
        if (session.user.role != 'admin') {
            const user = session.user
            const siswa = await this.siswaService.findByAccount(user.id)

            return {
                userId: user.id,
                siswaId: siswa.id,
                nis: siswa.nis,
                name: user.name,
                role: user.role
            }
        } else {
            const user = session.user
            return {
                userId: user.id,
                siswaId: null,
                name: user.name,
                role: user.role
            }
        }
    }
}

@Controller('siswa')
export class SiswaController {
    constructor(readonly service: SiswaService) { }

    @Get()
    async get(
        @Session() session: UserSession,
        @Query("kelas") kelas?: string,
        @Query("agendaId") agendaId?: string,
        @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
        @Query("offset", new ParseIntPipe({ optional: true })) offset?: number,
    ) {
        if (session.user.role != 'admin') throw new UnauthorizedException()
        return await this.service.listAll({ kelas, agendaId }, { limit, offset })
    }

    @Get(':id')
    async findById(
        @Session() session: UserSession,
        @Param('id') siswaId: string
    ) {
        if (session.user.role != 'admin') throw new UnauthorizedException()
        return await this.service.findById(siswaId)
    }

    @Post(':id/set-password')
    async setPassword(
        @Session() session: UserSession,
        @Param('id') siswaId: string,
        @Body() dto: SiswaSetPasswordDto
    ) {
        if (session.user.role != 'admin') throw new UnauthorizedException()

        await this.service.setPassword(siswaId, dto.password)
        return { message: "Password set." };
    }

    @Post(':id/set-account')
    async setAccount(
        @Session() session: UserSession,
        @Param('id') siswaId: string,
    ) {
        if (session.user.role != 'admin') throw new UnauthorizedException()

        // Handled via createAccount which now takes DbTransaction.
        // For simple API call, we'll use a direct call if possible or fix the service.
        // Since we are refactoring, I'll ensure the service has a compatible method.
        // Wait, SiswaService.createAccount in nexus-lms-be takes (tx, id).
        // For controller, we use the global db for transaction if needed.
        await db.transaction(async (tx) => {
            await this.service.createAccount(tx as any, siswaId)
        });

        return { message: "Account set." };
    }
}