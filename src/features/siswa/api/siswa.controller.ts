import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UnauthorizedException,
} from '@nestjs/common';
import { SiswaService } from '../services/siswa.service';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session, } from '@thallesp/nestjs-better-auth'
import { SiswaSetPasswordDto } from './siswa.dto';

@Controller('siswa')
export class SiswaController {
    constructor(readonly service: SiswaService) { }

    @Get()
    async get(
        @Session() session: UserSession,
        @Query("kelas") kelas?: string,
        @Query("agendaId") agendaId?: string
    ) {
        if (session.user.role != 'admin') throw new UnauthorizedException()
        return await this.service.listAll({ kelas, agendaId })
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

        await this.service.createAccount(siswaId)
        return { message: "Account set." };
    }
}
