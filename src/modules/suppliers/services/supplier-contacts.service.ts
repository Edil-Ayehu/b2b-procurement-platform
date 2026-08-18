import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierContact } from "../entities/supplier-contact.entity";
import { Repository } from "typeorm";
import { Supplier } from "../entities/supplier.entity";
import { CreateSupplierContactDto } from "../dto/create-supplier-contact.dto";
import { UpdateSupplierContactDto } from "../dto/update-supplier-contact.dto";

@Injectable()
export class SupplierContactsService {
    constructor(
        @InjectRepository(SupplierContact)
        private readonly contactRepository: Repository<SupplierContact>,

        @InjectRepository(Supplier)
        private readonly supplierRepository: Repository<Supplier>
    ) {}

    private async getSupplier(
        organizationId: string,
        supplierId: string,
    ) {
        const supplier = await this.supplierRepository.findOne({
            where: {
                organizationId,
                id: supplierId,
            }
        });

        if (!supplier) {
            throw new NotFoundException("Supplier not found!");
        }

        return supplier;
    }

    async create(
        organizationId: string,
        supplierId: string,
        dto: CreateSupplierContactDto
    ) {
        await this.getSupplier(organizationId, supplierId); 

        const existing = await this.contactRepository.findOne({
            where: {
                email: dto.email,
                supplierId
            }
        });

        if (existing) {
            throw new ConflictException('Supplier contact already exists!')
        }

        if (dto.isPrimary) {
            await this.contactRepository.update(
                {
                    supplierId
                },
                {
                    isPrimary: false
                }
            );
        }

        const contact = this.contactRepository.create({
            supplierId,

            firstName: dto.firstName,

            lastName: dto.lastName,

            jobTitle: dto.jobTitle ?? null,

            email: dto.email,

            phone: dto.phone ?? null,

            isPrimary: dto.isPrimary ?? false
        });

        return await this.contactRepository.save(contact);
    }

    async findAll(
        organizationId: string,
        supplierId: string
    ) {
        await this.getSupplier(organizationId, supplierId);

        return await this.contactRepository.find({
            where: {
                supplierId,
                isActive: true
            },
            order: {
                isPrimary: 'DESC',
                firstName: 'ASC'
            }
        });
    }

    async findOne(
        organizationId: string,
        supplierId: string,
        contactId: string,
    ) {
        await this.getSupplier(organizationId, supplierId);

        const contact = await this.contactRepository.findOne({
            where: {
                id: contactId,
                supplierId,
                isActive: true
            }
        });

        if (!contact) {
            throw new NotFoundException('Supplier contact not found')
        }

        return contact;
    }

    async update(
        organizationId: string,
        supplierId: string,
        contactId: string,
        dto: UpdateSupplierContactDto,
    ) {

        const contact = await this.findOne(organizationId, supplierId, contactId);

        if (dto.email) {
            const existing = await this.contactRepository.findOne({
                where: {
                    supplierId,
                    email: dto.email
                }
            });

            if (existing && existing.id !== contact.id) {
                throw new ConflictException("Supplier contact already exist");
            }
        }

        if (dto.isPrimary) {
            await this.contactRepository.update(
                {
                    supplierId,
                },
                {
                    isPrimary: false,
                }
            );
        }

        Object.assign(
            contact,
            dto
        );

        return await this.contactRepository.save(contact);
    }

    async remove(
        organizationId: string,
        supplierId: string,
        contactId: string,
    ) {
        const contact = await this.findOne(organizationId, supplierId, contactId)

        contact.isActive = false
        contact.isPrimary = false

        return await this.contactRepository.save(contact);
    }
}