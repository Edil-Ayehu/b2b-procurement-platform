import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService
    ) {}

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({
            where: {
                email: registerDto.email
            }
        });

        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(
            registerDto.password,
            12,
        );

        const user = this.userRepository.create({
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            email: registerDto.email,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(user);

        return {
            id: savedUser.id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            isActive: savedUser.isActive,
            createdAt: savedUser.createdAt,
        }
    }

    async login(loginDto: LoginDto) {
        const user = await this.userRepository.findOne({
            where: {
                email: loginDto.email
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatches = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User account is inactive');
        }

        return this.generateTokens(user);
    }

    private async generateTokens(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken = await this.jwtService.signAsync(
            payload,
            {
                expiresIn: '15m',
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            payload,
            {
                expiresIn: '7d'
            }
        );

        const refreshTokenHash = await bcrypt.hash(
            refreshToken,
            12,
        );

        await this.userRepository.update(
            user.id,
            {
                refreshTokenHash,
            }
        );

        return {
            accessToken,
            refreshToken,
        }
    }
}
