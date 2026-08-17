import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrganizationPermissionGuard } from '../organizations/guards/organization-permission.guard';
import { RequirePermission } from '../organizations/decorators/require-permission.decorator';
import { OrganizationPermission } from '../organizations/enums/organization-permission.enum';
import { CurrentOrganization } from '../organizations/decorators/current-organization.decorator';
import { CreateProcurementRequestDto } from './dto/create-procurement-request.dto';
import { Request } from 'express';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UpdateProcurementRequestDto } from './dto/update-procurement-request.dto';

@Controller('organizations/:organizationId/procurement-requests')
@UseGuards(JwtAuthGuard, OrganizationPermissionGuard)
export class ProcurementController {
    constructor(
        private readonly procurementService: ProcurementService
    ) {}

    @Post()
    @RequirePermission(OrganizationPermission.PROCUREMENT_CREATE)
    async create(
        @CurrentOrganization() organizationId: string,
        @Req() request: Request & { user: AuthenticatedUser },
        @Body() dto: CreateProcurementRequestDto,
    ) {
        return await this.procurementService.create(
            organizationId,
            request.user.id,
            dto,
        )
    }

    @Get()
    @RequirePermission(
        OrganizationPermission.PROCUREMENT_VIEW
    )
    findAll(
        @CurrentOrganization() organizationId: string
    ) {
        return this.procurementService.findAll(organizationId)
    }

    @Get(":requestId")
    @RequirePermission(OrganizationPermission.PROCUREMENT_VIEW)
    findOne(
        @CurrentOrganization() organizationId: string,
        @Param('requestId') requestId: string,
    ) {
        return this.procurementService.findOne(
            organizationId,
            requestId,
        )
    }

    @Patch(":requestId")
    @RequirePermission(OrganizationPermission.PROCUREMENT_UPDATE)
    update(
        @CurrentOrganization() organizationId: string,
        @Param('requestId') requestId: string,
        @Req() request: Request & { user: AuthenticatedUser},
        @Body() dto: UpdateProcurementRequestDto
    ) {
        return this.procurementService.update(
            organizationId,
            requestId,
            request.user.id,
            dto
        )
    }

    @Delete(":requestId")
    async deleteRequest(
        @CurrentOrganization() organizationId: string,
        @Param('requestId') requestId: string,
    ) {
        return await this.procurementService.deleteRequest(
            organizationId,
            requestId,
        )
    }
}
