
import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { LocalAuthGuard } from './strategies/local.guard';
import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategies/jwt.guard';

const LoginSchema = z.object({
    username: z.string(),
    password: z.string()
})

class LoginDto extends createZodDto(LoginSchema) { }

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('auth/login')
    async login(@Request() req, @Body() _body: LoginDto) {
        return this.authService.login(req.user);
    }

    @UseGuards(LocalAuthGuard)
    @Post('auth/logout')
    async logout(@Request() req) {
        return req.logout();
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async fetchProfile(@Request() req) {
        return req.user
    }
}
