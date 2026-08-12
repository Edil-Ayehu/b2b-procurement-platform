import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

describe('AuthService', () => {
    let service: AuthService;
    let userRepo: any;
    let sessionRepo: any;
    let jwtService: JwtService;
    let configService: ConfigService;

    let sessionsMap: Map<string, UserSession>;

    const mockUser: User = {
        id: 'user-uuid-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        mockUser.password = await bcrypt.hash('password123', 12);
        mockUser.isActive = true;

        sessionsMap = new Map();

        userRepo = {
            findOne: jest.fn().mockImplementation(({ where }) => {
                if (where.email === mockUser.email || where.id === mockUser.id) {
                    return Promise.resolve({ ...mockUser });
                }
                return Promise.resolve(null);
            }),
            create: jest.fn().mockImplementation((dto) => ({ id: 'new-user-id', ...dto, isActive: true, createdAt: new Date() })),
            save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
        };

        sessionRepo = {
            findOne: jest.fn().mockImplementation(({ where }) => {
                const session = sessionsMap.get(where.id);
                if (session) {
                    return Promise.resolve({ ...session, user: { ...mockUser } });
                }
                return Promise.resolve(null);
            }),
            create: jest.fn().mockImplementation((data) => {
                const session: UserSession = {
                    id: randomUUID(),
                    userId: data.userId,
                    user: mockUser,
                    deviceName: data.deviceName ?? null,
                    userAgent: data.userAgent ?? null,
                    ipAddress: data.ipAddress ?? null,
                    refreshTokenHash: data.refreshTokenHash ?? '',
                    expiresAt: data.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    revokedAt: data.revokedAt ?? null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                return session;
            }),
            save: jest.fn().mockImplementation((session: UserSession) => {
                sessionsMap.set(session.id, { ...session });
                return Promise.resolve({ ...session });
            }),
            update: jest.fn().mockImplementation((criteria, partial) => {
                for (const [id, session] of sessionsMap.entries()) {
                    if (criteria.userId && session.userId !== criteria.userId) continue;
                    if (criteria.id && session.id !== criteria.id) continue;
                    if (criteria.revokedAt === null && session.revokedAt !== null) continue;

                    Object.assign(session, partial);
                    sessionsMap.set(id, session);
                }
                return Promise.resolve({ affected: sessionsMap.size });
            }),
        };

        configService = {
            getOrThrow: jest.fn().mockImplementation((key: string) => {
                if (key === 'JWT_SECRET') return 'test_jwt_secret';
                if (key === 'JWT_REFRESH_SECRET') return 'test_jwt_refresh_secret';
                throw new Error(`Missing config key: ${key}`);
            }),
        } as any;

        jwtService = new JwtService({});

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getRepositoryToken(User), useValue: userRepo },
                { provide: getRepositoryToken(UserSession), useValue: sessionRepo },
                { provide: JwtService, useValue: jwtService },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('login & refresh flow', () => {
        it('should issue tokens on login and allow refreshing with new token', async () => {
            const loginTokens = await service.login({ email: 'test@example.com', password: 'password123' });
            expect(loginTokens.accessToken).toBeDefined();
            expect(loginTokens.refreshToken).toBeDefined();

            const firstRefreshToken = loginTokens.refreshToken;

            // First refresh call using firstRefreshToken
            const refreshedTokens = await service.refresh(firstRefreshToken);
            expect(refreshedTokens.accessToken).toBeDefined();
            expect(refreshedTokens.refreshToken).toBeDefined();
            expect(refreshedTokens.refreshToken).not.toEqual(firstRefreshToken);
        });

        it('should reject reuse of an old refresh token and revoke the session', async () => {
            const loginTokens = await service.login({ email: 'test@example.com', password: 'password123' });
            const oldRefreshToken = loginTokens.refreshToken;

            // 1st Refresh: uses oldRefreshToken -> returns new tokens
            const newTokens = await service.refresh(oldRefreshToken);
            expect(newTokens.refreshToken).not.toEqual(oldRefreshToken);

            // 2nd Refresh: attempts to use oldRefreshToken again -> MUST FAIL and revoke session
            await expect(service.refresh(oldRefreshToken)).rejects.toThrow(
                new UnauthorizedException('Invalid refresh token'),
            );

            // Verify session was revoked in DB
            const sessionId = Array.from(sessionsMap.keys())[0];
            const storedSession = sessionsMap.get(sessionId);
            expect(storedSession?.revokedAt).not.toBeNull();

            // 3rd Refresh: even using newTokens should fail now because session was revoked
            await expect(service.refresh(newTokens.refreshToken)).rejects.toThrow(
                new UnauthorizedException('Session has been revoked'),
            );
        });
    });

    describe('logout & logoutAll flow', () => {
        it('should revoke a single session on logout', async () => {
            const loginTokens = await service.login({ email: 'test@example.com', password: 'password123' });
            const result = await service.logout(loginTokens.refreshToken);
            expect(result.message).toContain('Logged out successfully');

            // Trying to refresh after logout should fail
            await expect(service.refresh(loginTokens.refreshToken)).rejects.toThrow(
                new UnauthorizedException('Session has been revoked'),
            );
        });

        it('should invalidate ALL active user sessions on logoutAll', async () => {
            // Login from Device 1 (Session 1)
            const device1Tokens = await service.login({ email: 'test@example.com', password: 'password123' }, { deviceName: 'Phone' });
            // Login from Device 2 (Session 2)
            const device2Tokens = await service.login({ email: 'test@example.com', password: 'password123' }, { deviceName: 'Laptop' });

            expect(sessionsMap.size).toBe(2);

            // Call logoutAll for mockUser.id
            const logoutResult = await service.logoutAll(mockUser.id);
            expect(logoutResult.message).toBe('Logged out from all devices.');

            // Check both sessions are now revoked
            for (const session of sessionsMap.values()) {
                expect(session.revokedAt).not.toBeNull();
            }

            // Attempting to refresh with Device 1's refresh token must fail
            await expect(service.refresh(device1Tokens.refreshToken)).rejects.toThrow(
                new UnauthorizedException('Session has been revoked'),
            );

            // Attempting to refresh with Device 2's refresh token must fail
            await expect(service.refresh(device2Tokens.refreshToken)).rejects.toThrow(
                new UnauthorizedException('Session has been revoked'),
            );
        });
    });
});
