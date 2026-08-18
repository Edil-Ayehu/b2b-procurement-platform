import { InjectRepository } from "@nestjs/typeorm";
import { Supplier } from "../entities/supplier.entity";
import { Repository } from "typeorm";
import { SupplierCategory } from "../entities/supplier-category.entity";
import { CreateSupplierDto } from "../dto/create-supplier.dto";
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateSupplierDto } from "../dto/update-supplier.dto";

@Injectable()
export class SupplierService {
    constructor(
        @InjectRepository(Supplier)
        private readonly supplierRepository: Repository<Supplier>,

        @InjectRepository(SupplierCategory)
        private readonly categoryRepository: Repository<SupplierCategory>
    ) {}

    async create(
        organizationId: string,
        dto: CreateSupplierDto,
    ) {
        const category = await this.categoryRepository.findOne({
            where: {
                id: dto.categoryId,
                organizationId,
                isActive: true,
            }
        });

        if (!category) {
            throw new NotFoundException("Supplier category not found!")
        }

        const existing = await this.supplierRepository.findOne({
            where: {
                name: dto.name,
                organizationId,
            }
        });

        if (existing) {
            throw new ConflictException("Supplier already exists!");
        }

        const supplier = this.supplierRepository.create({
            organizationId,

            categoryId: dto.categoryId,

            name: dto.name,

            type: dto.type,

            registrationNumber: dto.registrationNumber ?? null,

            taxIdentificationNumber: dto.taxIdentificationNumber ?? null,

            industry: dto.industry ?? null,


            country: dto.country ?? null,

            city: dto.city ?? null,

            address: dto.address ?? null,

            phone: dto.phone ?? null,

            email: dto.email ?? null,

            website: dto.email ?? null,

            notes: dto.notes ?? null,
        });

        return await this.supplierRepository.save(supplier);
    }

    async findAll(
        organizationId: string,
    ) {
        return await this.supplierRepository.find({
            where: {
                organizationId
            },
            relations: {
                category: true,
                contacts: true,
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async findOne(
        organizationId: string,
        supplierId: string,
    ) {
        const supplier = await this.supplierRepository.findOne({
            where: {
                organizationId,
                id: supplierId,
            },
            relations: {
                category: true,
                contacts: true,
            }
        });

        if (!supplier) {
            throw new NotFoundException("Supplier not found")
        }

        return supplier;
    }

    async update(
        organizationId: string,
        supplierId: string,
        dto: UpdateSupplierDto,
    ) {

        const supplier = await this.findOne(organizationId, supplierId);

        if (dto.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: {
                    id: dto.categoryId,
                    organizationId,
                    isActive: true,
                }
            });

            if (!category) {
                throw new NotFoundException("Supplier category not found");
            }

            supplier.categoryId = category.id;
        }

        if (dto.name) {
            const existing = await this.supplierRepository.findOne({
                where: {
                    name: dto.name,
                    organizationId,
                }
            });

            if (existing && existing.id !== supplier.id) {
                throw new ConflictException("Supplier already exists!")
            }
        }

        Object.assign(
            supplier,
            {
                ...dto,
                categoryId: supplier.categoryId,
            }
        )

        return await this.supplierRepository.save(supplier);
    }
}