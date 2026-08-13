import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrganizationRoleGuard } from './guards/organization-role.guard';
import { OrganizationRoles } from './decorators/organization-roles.decorator';
import { OrganizationRole } from './enums/organization-role.enum';
import { AddOrganizationMemberDto } from './dto/add-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';


@Controller('organizations')
export class OrganizationsController {
    constructor(
        private readonly organizationsService: OrganizationsService
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() createOrganizationDto: CreateOrganizationDto,
        @Req() request: Request & { user: AuthenticatedUser}
    ) {
        return await this.organizationsService.create(request.user.id, createOrganizationDto)
    }

    @Post(':organizationId/members')
    @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
    @OrganizationRoles(OrganizationRole.ADMIN, OrganizationRole.OWNER)
    addMember(
        @Param('organizationId') organizationId: string,
        @Body() addOrganizationMemberDto: AddOrganizationMemberDto,
    ) {
        return this.organizationsService.addMember(
            organizationId, 
            addOrganizationMemberDto,
        )
    }

    @Get(':organizationId/members')
    @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
    @OrganizationRoles(OrganizationRole.ADMIN, OrganizationRole.OWNER, OrganizationRole.PROCUREMENT_MANAGER)
    getMembers(
        @Param('organizationId') organizationId: string
    ) {
        return this.organizationsService.getMembers(organizationId)
    }

    @Patch(":organizationId/members/:memberId")
    @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
    @OrganizationRoles(OrganizationRole.ADMIN, OrganizationRole.OWNER)
    async updateMemberRole(
       @Body() dto: UpdateOrganizationMemberDto,
       @Param('organizationId') organizationId: string,
       @Param('memberId') memberId: string,
    ) {
        return await this.organizationsService.updateMemberRole(
            organizationId,
            memberId,
            dto
        );
    }
}
