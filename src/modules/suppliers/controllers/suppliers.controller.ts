import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { SupplierService } from "../services/supplier.service";
import { CurrentOrganization } from "../../organizations/decorators/current-organization.decorator";
import { CreateSupplierDto } from "../dto/create-supplier.dto";
import { UpdateSupplierDto } from "../dto/update-supplier.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { OrganizationPermissionGuard } from "../../organizations/guards/organization-permission.guard";
import { RequirePermission } from "../../organizations/decorators/require-permission.decorator";
import { OrganizationPermission } from "../../organizations/enums/organization-permission.enum";

@Controller("organizations/:organizationId/suppliers")
@UseGuards( JwtAuthGuard, OrganizationPermissionGuard )
export class SuppliersController {
    constructor(
        private readonly supplierService: SupplierService
    ) {}


    @Post()
    @RequirePermission(OrganizationPermission.SUPPLIER_CREATE)
    async create(
        @CurrentOrganization() organizationId: string,
        @Body() dto: CreateSupplierDto
    ) {
        return await this.supplierService.create(
            organizationId,
            dto,
        );
    }

    @Get()
    @RequirePermission(OrganizationPermission.SUPPLIER_VIEW)
    async findAll(
        @CurrentOrganization() organizationId:string,
    ) {
        return await this.supplierService.findAll(
            organizationId,
        );
    }

    @Get(':supplierId')
    @RequirePermission(OrganizationPermission.SUPPLIER_VIEW)
    async findOne(
        @CurrentOrganization() organizationId: string,
        @Param('supplierId') supplierId: string,
    ) {
        return await this.supplierService.findOne(
            organizationId,
            supplierId,
        );
    }

    @Patch(":supplierId")
    @RequirePermission(OrganizationPermission.SUPPLIER_UPDATE)
    async update(
        @CurrentOrganization() organizationId: string,
        @Param('supplierId') supplierId: string,
        @Body() dto: UpdateSupplierDto
    ) {
        return await this.supplierService.update(
            organizationId,
            supplierId,
            dto
        );
    }


}