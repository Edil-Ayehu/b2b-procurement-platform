import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationMember } from './entities/organization-member.entity';
import { User } from '../users/entities/user.entity';
import { OrganizationRoleGuard } from './guards/organization-role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        Organization,
        OrganizationMember,
        User,
    ])
  ],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    OrganizationRoleGuard,
],
  exports: [
    OrganizationsService,
    OrganizationRoleGuard,
]
})
export class OrganizationsModule {}
