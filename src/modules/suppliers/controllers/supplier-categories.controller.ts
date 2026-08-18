import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { SupplierCategoriesService } from "../services/supplier-categories.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { OrganizationPermissionGuard } from "../../organizations/guards/organization-permission.guard";
import { CurrentOrganization } from "../../organizations/decorators/current-organization.decorator";
import { CreateSupplierCategoryDto } from "../dto/create-supplier-category.dto";
import { RequirePermission } from "../../organizations/decorators/require-permission.decorator";
import { OrganizationPermission } from "../../organizations/enums/organization-permission.enum";
import { UpdateSupplierCategoryDto } from "../dto/update-supplier-category.dto";

@Controller('organizations/:organizationId/supplier-categories')
@UseGuards(JwtAuthGuard, OrganizationPermissionGuard )
export class SupplierCategoriesController {
    constructor(
        private readonly categoryService: SupplierCategoriesService
    ) {}

    @Post()
    @RequirePermission(OrganizationPermission.SUPPLIER_MANAGE_CATEGORIES)
    async create(
        @CurrentOrganization() OrganizationId: string,
        @Body() dto: CreateSupplierCategoryDto,
    ) {
        return await this.categoryService.create(OrganizationId,dto)
    }

    @Get()
    @RequirePermission(OrganizationPermission.SUPPLIER_VIEW)
    async findAll(
        @CurrentOrganization() organizationId: string,
    ) {
        return await this.categoryService.findAll(organizationId)
    }

    @Get(":categoryId")
    @RequirePermission(OrganizationPermission.SUPPLIER_VIEW)
    async findOne(
        @CurrentOrganization() organizationId: string,
        @Param('categoryId') categoryId: string
    ) {
        return await this.categoryService.findOne(organizationId,categoryId)
    }

    @Patch(':categoryId')
    @RequirePermission(OrganizationPermission.SUPPLIER_MANAGE_CATEGORIES)
    async update(
        @CurrentOrganization() organizationId: string,
        @Param('categoryId') categoryId: string,
        @Body() dto: UpdateSupplierCategoryDto,
    ) {
        return await this.categoryService.update(
            organizationId,
            categoryId,
            dto,
        );
    }
}