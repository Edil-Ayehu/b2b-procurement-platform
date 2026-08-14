import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { OrganizationRoles } from './decorators/organization-roles.decorator';
import { OrganizationRole } from './enums/organization-role.enum';
import { AddOrganizationMemberDto } from './dto/add-organization-member.dto';
import { UpdateOrganizationMemberDto } from './dto/update-organization-member.dto';
import { OrganizationPermissionGuard } from './guards/organization-permission.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { OrganizationPermission } from './enums/organization-permission.enum';
import { CurrentOrganization } from './decorators/current-organization.decorator';


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
    @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
    @RequirePermission(OrganizationPermission.MEMBER_INVITE)
    addMember(
        @CurrentOrganization() organizationId: string,
        @Body() addOrganizationMemberDto: AddOrganizationMemberDto,
    ) {
        return this.organizationsService.addMember(
            organizationId, 
            addOrganizationMemberDto,
        )
    }

    @Get(':organizationId/members')
    @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
    @RequirePermission(OrganizationPermission.MEMBER_VIEW)
    getMembers(
        @CurrentOrganization() organizationId: string
    ) {
        return this.organizationsService.getMembers(organizationId)
    }

    @Patch(":organizationId/members/:memberId")
    @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
    @RequirePermission(OrganizationPermission.MEMBER_UPDATE)
    async updateMemberRole(
       @Body() dto: UpdateOrganizationMemberDto,
       @CurrentOrganization() organizationId: string,
       @Param('memberId') memberId: string,
    ) {
        return await this.organizationsService.updateMemberRole(
            organizationId,
            memberId,
            dto
        );
    }

    @Delete(":organizationId/members/:memberId")
    @UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
    @RequirePermission(OrganizationPermission.MEMBER_REMOVE)
    @OrganizationRoles(OrganizationRole.ADMIN, OrganizationRole.OWNER)
    async removeMember(
        @CurrentOrganization() organizationId: string,
        @Param('memberId') memberId: string,
    ) {
        return await this.organizationsService.removeMember(
            organizationId,
            memberId,
        );
    }
}
