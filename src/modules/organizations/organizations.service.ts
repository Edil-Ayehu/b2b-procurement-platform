import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Repository } from 'typeorm';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationRole } from './enums/organization-role.enum';
import { AddOrganizationMemberDto } from './dto/add-organization-member.dto';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepo: Repository<Organization>,

        @InjectRepository(OrganizationMember)
        private readonly memberRepo: Repository<OrganizationMember>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}

    private generateSlug(name: string): string {
        return name
        .toLocaleLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    private async generateUniqueSlug(name: string): Promise<string> {

        const baseSlug = this.generateSlug(name)

        let slug = baseSlug;
        let counter = 1;

        while(
            await this.organizationRepo.exists({where: { slug }})
        ) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }

    async create(
        userId: string,
        dto: CreateOrganizationDto,
    ) {
        const user = await this.userRepo.findOne({
            where: {
                id: userId,
            }
        });

        if (!user) {
            throw new NotFoundException('User not found')
        }

        const slug = await this.generateUniqueSlug(dto.name);

        const organization = this.organizationRepo.create({
            name: dto.name,
            slug,
            description: dto.description ?? null,
            isActive: true,
        });

        const savedOrgination = await this.organizationRepo.save(organization);

        const owner = this.memberRepo.create({
            organizationId: savedOrgination.id,
            userId,
            role: OrganizationRole.OWNER,
            isActive: true,
        });

        await this.memberRepo.save(owner);

        return {
            organization: savedOrgination,
            membership: {
                id: owner.id,
                role: owner.role,
            }
        }
    }

    async addMember(
        organizationId: string,
        dto: AddOrganizationMemberDto,
    ) {

        if (dto.role == OrganizationRole.OWNER) {
            throw new ConflictException("Owner role can't be assigned through this endpoint.")
        }

        const organization = await this.organizationRepo.findOne({
            where: {
                id: organizationId,
                isActive: true,
            }
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        const user = await this.userRepo.findOne({
            where: {
                email: dto.email
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const existing = await this.memberRepo.findOne({
            where: {
                organizationId,
                userId: user.id
            }
        });

        if (existing) {
            throw new ConflictException('User is already a member of this organization');
        }

        const member = this.memberRepo.create({
            organizationId,
            userId: user.id,
            role: dto.role,
            isActive: true,
        });

        const saved = await this.memberRepo.save(member);

        return {
            id: saved.id,
            organizationId,
            userId: user.id,
            role: saved.role,
            isActive: saved.isActive
        }
    }

    async findMembership(
        organizationId: string,
        userId: string,
    ) {
        return this.memberRepo.findOne({
            where: {
                organizationId,
                userId,
            },
            relations: {
                organization: true,
                user: true,
            }
        });
    }

    async getMembers(
        organizationId: string,
    ) {
        const members = await this.memberRepo.find({
            where: {
                organizationId,
                isActive: true
            },
            relations: {
                user: true,
            },
            order: {
                createdAt: 'ASC'
            }
        });

        return members.map((member) => ({
            id: member.id,

            user: {
                id: member.user.id,
                firstName: member.user.firstName,
                lastName: member.user.lastName,
                email: member.user.email,
            },

            role: member.role,

            isActive: member.isActive,

            createdAt: member.createdAt,
        }));
    }
}
