import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Repository } from 'typeorm';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationRole } from './enums/organization-role.enum';

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
}
