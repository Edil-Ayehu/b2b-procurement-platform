import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserSession } from './entities/user-session.entity';
import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import { createHash, randomUUID } from 'crypto';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(UserSession)
        private readonly userSessionRepository: Repository<UserSession>,

        private readonly jwtService: JwtService,

        private readonly configService: ConfigService,
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

    async login(
        loginDto: LoginDto,
        metadata?: {
            deviceName?: string,
            userAgent?: string,
            ipAddress?: string,
        }
    ) {
        const user = await this.userRepository.findOne({
            where: {
                email: loginDto.email
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid login credentials');
        }

        const passwordMatches = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid login credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User account is inactive');
        }

        const session = await this.createSession(
            user,
            metadata?.deviceName,
            metadata?.userAgent,
            metadata?.ipAddress,
        );

        const tokens = await this.generateTokens(
            user,
            session,
        );

        return tokens;
    }

    private async createSession(
        user: User,
        deviceName?: string,
        userAgent?: string,
        ipAddress?: string,
    ) {
        const session = this.userSessionRepository.create({
            userId: user.id,
            deviceName: deviceName ?? null,
            userAgent: userAgent ?? null,
            ipAddress: ipAddress ?? null,
            refreshTokenHash: '',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revokedAt: null,
        });

        return this.userSessionRepository.save(session)
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private async generateTokens(
        user: User,
        session: UserSession,
    ) {
        const accessPayload = {
            sub: user.id,
            email: user.email,
        };

        const refreshPayload = {
            sub: user.id,
            sid: session.id,
            type: 'refresh' as const,
        };

        const accessToken = await this.jwtService.signAsync(
            accessPayload,
            {
                secret: this.configService.getOrThrow<string>('JWT_SECRET'),
                expiresIn: '15m',
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            refreshPayload,
            {
                secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d'
            }
        );

        const tokenDigest = this.hashToken(refreshToken);
        const refreshTokenHash = await bcrypt.hash(
            tokenDigest,
            12,
        );

        session.refreshTokenHash = refreshTokenHash;
        await this.userSessionRepository.save(session);

        return {
            accessToken,
            refreshToken,
        }
    }

    async refresh(refreshToken: string) {
        let payload: RefreshTokenPayload;

        try {
            payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
                refreshToken,
                {
                    secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
                },
            );

        } catch {
            throw new UnauthorizedException("Invalid or expired refresh token")
        }

        if (payload.type != 'refresh') {
            throw new UnauthorizedException("Invalid refresh token")
        }

        const session = await this.userSessionRepository.findOne({
            where: {
                id: payload.sid,
            },
            relations: {
                user: true
            }
        })

        if (!session) {
            throw new UnauthorizedException("Session not found")
        }

        if (session.revokedAt) {
            throw new UnauthorizedException("Session has been revoked")
        }

        if (new Date(session.expiresAt).getTime() < Date.now()) {
            throw new UnauthorizedException("Session has expired.")
        }

        const tokenDigest = this.hashToken(refreshToken);
        const tokenMatches = await bcrypt.compare(
            tokenDigest,
            session.refreshTokenHash,
        )

        if (!tokenMatches) {
            // Refresh-token reuse detected
            session.revokedAt = new Date();
            await this.userSessionRepository.save(session);

            throw new UnauthorizedException("Invalid refresh token")
        }

        const user = session.user

        if (!user || !user.isActive) {
            throw new UnauthorizedException("User account is inactive")
        }

        // Generate NEW tokens and rotate stored refresh token hash
        const tokens = await this.generateTokens(user, session);

        return tokens;
    }

    async logout(refreshToken: string) {
        let payload: RefreshTokenPayload;

        // 1. Verify refresh token
        try{
            payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
                refreshToken,
                {
                    secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
                }
            )
        } catch {
            // Event if the token is expired, logout should be idempotent.

            return {
                message: "Logged out successfully(1)"
            }
        }

        // 2. Make sure this is actually a refresh token

        if (payload.type !== 'refresh') {
            return {
                message: "Logged out successfully(2)",
            }
        }

        // 3. Find the session
        const session = await this.userSessionRepository.findOne({
            where: {
                id: payload.sid,
                userId: payload.sub,
            },
        });

         if (!session) {
            return {
                message: 'Logged out successfully(3)'
            }
        }

        // 4. Already revoked - nothing to do
        if (session.revokedAt) {
            return {
                message: "Logged out successfully(4)",
            }
        }

        // 5. verify that this is the current refresh token
        const tokenDigest = this.hashToken(refreshToken);

        const tokenMatches = await bcrypt.compare(
            tokenDigest,
            session.refreshTokenHash,
        );

        if (!tokenMatches) {
            // this is an old/invalid refresh token.
            return {
                message: 'Logged out successfully(5)'
            }
        }


        // 6. Revoke the session
        session.revokedAt = new Date();

        await this.userSessionRepository.save(session);

        return {
            message: "Logged out successfully.(6)"
        }
    }

    async logoutAll(userId: string) {
        await this.userSessionRepository.update(
            {
                userId: userId,
                revokedAt: IsNull(),
            },
            {
                revokedAt: new Date(),
            },
        );

        return {
            message: "Logged out from all devices.",
        };
    }

    async getSessions(userId: string) {
        return this.userSessionRepository.find({
            where: {
                userId,
                revokedAt: IsNull(),
            },
            select: {
                id: true,
                deviceName: true,
                userAgent: true,
                ipAddress: true,
                expiresAt: true,
                createdAt: true,
            },
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async revokeSession(
        userId: string,
        sessionId: string,
    ) {
        const session = await this.userSessionRepository.findOne({
            where: {
                id: sessionId,
                userId,
            }
        });

        if (!session) {
            throw new UnauthorizedException('Session not found');
        }

        session.revokedAt = new Date();

        await this.userSessionRepository.save(session);

        return {
            message: "Session revoked successfully!",
        }
    }

}
