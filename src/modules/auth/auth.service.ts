import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
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
}
