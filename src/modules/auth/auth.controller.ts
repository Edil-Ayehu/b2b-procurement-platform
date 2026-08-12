import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post("register")
    async register(
        @Body() registerDto: RegisterDto
    ) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Req() request: Request,
    ) {
        return this.authService.login(
            loginDto,
            {
                deviceName: loginDto.deviceName,
                userAgent: request.headers['user-agent'],
                ipAddress: request.ip,
            }
        );
    }

    @Post('refresh')
    refresh(
        @Body() refreshTokenDto: RefreshTokenDto,
    ) {
        return this.authService.refresh(
            refreshTokenDto.refreshToken,
        );
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(
        @Req() request: Request & {
            user: AuthenticatedUser;
        }
    ) {
        return request.user
    }

    @Post('logout')
    logout(
        @Body() refreshTokenDto: RefreshTokenDto
    ) {
        return this.authService.logout(
            refreshTokenDto.refreshToken
        );
    }
}
