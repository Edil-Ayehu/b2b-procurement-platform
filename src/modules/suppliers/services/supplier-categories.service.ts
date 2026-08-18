import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierCategory } from "../entities/supplier-category.entity";
import { Repository } from "typeorm";
import { CreateSupplierCategoryDto } from "../dto/create-supplier-category.dto";
import { UpdateSupplierCategoryDto } from "../dto/update-supplier-category.dto";

@Injectable()
export class SupplierCategoriesService {

    constructor(
        @InjectRepository(SupplierCategory)
        private readonly categoryRepository: Repository<SupplierCategory>
    ) {}

    async create(
        organizationId: string,
        dto: CreateSupplierCategoryDto,
    ) {

        const existing = await this.categoryRepository.findOne({
            where: {
                organizationId,
                name: dto.name,
            }
        });

        if (existing) {
            throw new ConflictException('Supplier category already exists.')
        }

        const category = this.categoryRepository.create({
            organizationId,

            name: dto.name,

            description: dto.description ?? null,

            isActive: true,
        });

        return await this.categoryRepository.save(category);
    }

    async findAll(
        organizationId: string,
    ) {
        return await this.categoryRepository.find({
            where: {
                organizationId
            },
            order: {
                name: 'ASC'
            }
        });
    }

    async findOne(
        organizationId: string,
        categoryId: string,
    ) {
        const category = await this.categoryRepository.findOne({
            where: {
                organizationId,
                id: categoryId,
            }
        });

        if (!category) {
            throw new NotFoundException('Supplier category not found');
        }

        return category;
    }

    async update(
        organizationId: string,
        categoryId: string,
        dto: UpdateSupplierCategoryDto,
    ) {

        const category = await this.findOne(organizationId, categoryId);

        if (dto.name) {
            // check whether there is other supplier category with this name
            const existing = await this.categoryRepository.findOne({
                where: {
                    organizationId,
                    name: dto.name,
                }
            });

            if (existing && existing.id !== category.id) {
                throw new ConflictException('Supplier category already exists')
            }
        }

        Object.assign(category,dto);

        return await this.categoryRepository.save(category);
    }
}