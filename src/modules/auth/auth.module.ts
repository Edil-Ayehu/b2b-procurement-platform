import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { StringValue} from 'ms';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserSession } from './entities/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession]),

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') as StringValue ?? '15m',
        }
      }),
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
