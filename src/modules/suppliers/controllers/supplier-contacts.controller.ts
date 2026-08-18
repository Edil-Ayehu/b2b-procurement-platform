import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { OrganizationPermissionGuard } from "../../organizations/guards/organization-permission.guard";
import { SupplierContactsService } from "../services/supplier-contacts.service";
import { CurrentOrganization } from "../../organizations/decorators/current-organization.decorator";
import { CreateSupplierContactDto } from "../dto/create-supplier-contact.dto";
import { UpdateSupplierContactDto } from "../dto/update-supplier-contact.dto";
import { RequirePermission } from "../../organizations/decorators/require-permission.decorator";
import { OrganizationPermission } from "../../organizations/enums/organization-permission.enum";

@Controller('organizations/:organizationId/suppliers/:supplierId/contacts')
@UseGuards( JwtAuthGuard, OrganizationPermissionGuard )
export class SupplierContactsController {
    constructor(
        private readonly contactsService: SupplierContactsService
    ) {}

    @Post()
    @RequirePermission(OrganizationPermission.SUPPLIER_MANAGE_CONTACTS)
    async create(
        @CurrentOrganization() organizationId: string,
        @Param('supplierId') supplierId: string,
        @Body() dto: CreateSupplierContactDto,
    ) {
        return await this.contactsService.create(
            organizationId,
            supplierId,
            dto
        );
    }

    @Get()
    @RequirePermission(OrganizationPermission.SUPPLIER_VIEW)
    async findAll(
        @CurrentOrganization() organizationId: string,
        @Param('supplierId') supplierId: string,
    ) {
        return await this.contactsService.findAll(
            organizationId,
            supplierId,
        );
    }

    @Get(':contactId')
    @RequirePermission(OrganizationPermission.SUPPLIER_VIEW)
    async findOne(
        @CurrentOrganization() organizationId: string,
        @Param('supplierId') supplierId: string,
        @Param('contactId') contactId: string,
    ) {
        return await this.contactsService.findOne(
            organizationId,
            supplierId,
            contactId
        )
    }

    @Patch(':contactId')
    @RequirePermission(OrganizationPermission.SUPPLIER_MANAGE_CONTACTS)
    async udpate(
        @CurrentOrganization() organizationId: string,
        @Param('supplierId') supplierId: string,
        @Param('contactId') contactId: string,
        @Body() dto: UpdateSupplierContactDto
    ) {
        return await this.contactsService.update(
            organizationId,
            supplierId,
            contactId,
            dto,
        );
    }

    @Delete(':contactId')
    @RequirePermission(OrganizationPermission.SUPPLIER_MANAGE_CONTACTS)
    async remove(
        @CurrentOrganization() organizationId: string,
        @Param('supplierId') supplierId: string,
        @Param('contactId') contactId: string,
    ) {
        return await this.contactsService.remove(
            organizationId,
            supplierId,
            contactId
        );
    }
}