import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcurementRequest } from './entities/procurement-request.entity';
import { DataSource, Repository } from 'typeorm';
import { ProcurementRequestItem } from './entities/procurement-request-item.entity';
import { CreateProcurementRequestDto } from './dto/create-procurement-request.dto';
import { ProcurementRequestPriority } from './enums/procurement-request-priority.enum';
import { ProcurementRequestStatus } from './enums/procurement-request-status.enum';
import { UpdateProcurementRequestDto } from './dto/update-procurement-request.dto';
import { ApproveProcurementRequestDto } from './dto/approve-procurement-request.dto';
import { RejectProcurementRequestDto } from './dto/reject-procurement-request.dto';

@Injectable()
export class ProcurementService {
    constructor(
        @InjectRepository(ProcurementRequest)
        private readonly procurementRequestRepo: Repository<ProcurementRequest>,

        @InjectRepository(ProcurementRequestItem)
        private readonly procurementRequestItemRepo: Repository<ProcurementRequestItem>,

        private readonly dataSource: DataSource
    ) {}

    async create(
        organizationId: string,
        userId: string,
        dto: CreateProcurementRequestDto,
    ) {

        const request = this.procurementRequestRepo.create({
            organizationId,

            createdById: userId,

            title: dto.title,

            description: dto.description ?? null,

            priority: dto.priority ?? ProcurementRequestPriority.NORMAL,

            neededByDate: dto.needByDate ? new Date(dto.needByDate) : null,

            status: ProcurementRequestStatus.DRAFT,
        });

        const savedRequest = await this.procurementRequestRepo.save(request);

        const items = dto.items.map((item) => this.procurementRequestItemRepo.create({
            procurementRequestId: savedRequest.id,

            name: item.name,

            description: item.description ?? null,

            quantity: item.quantity.toString(),

            unit: item.unit,

            estimatedUnitPrice: item.estimatedUnitPrice !== undefined ? item.estimatedUnitPrice.toString() : null,

            currency: item.currency ?? null,

            notes: item.notes ?? null,
        }));

        await this.procurementRequestItemRepo.save(items)

        return this.findOne(
            organizationId,
            savedRequest.id,
        );
    }

    async findOne(
        organizationId: string,
        requestId: string,
    ) {

        const request = await this.procurementRequestRepo.findOne({
            where: {
                organizationId,
                id: requestId,
            }
        });

        if (!request) {
            throw new NotFoundException("Procurement request not found")
        }

        return {
            id: request.id,

            organizationId: request.organizationId,

            title: request.title,

            description: request.description,

            status: request.status,

            priority: request.priority,

            neededByDate: request.neededByDate,

            createdBy: request.createdBy ? {
                id: request.createdBy.id,
                firstName: request.createdBy.firstName,
                lastName: request.createdBy.lastName,
                email: request.createdBy.email
            }: null,

            approvedBy: request.approvedBy ? {
                id: request.approvedBy.id,
                firstName: request.approvedBy.firstName,
                lastName: request.approvedBy.lastName,
                email: request.approvedBy.email
            }: null,

            submittedAt: request.submittedAt,

            approvedAt: request.approvedAt,

            rejectedAt: request.rejectedAt,

            cancelledAt: request.cancelledAt,

            rejectionReason: request.rejectionReason,

            items: request.items,

            createdAt: request.createdAt,

            updatedAt: request.updatedAt,
        }
    }

    async findAll(
        organizationId: string
    ) {

        return this.procurementRequestRepo.find({
            where: {
                organizationId
            },
            relations: {
                createdBy: true,
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async update(
        organizationId: string,
        requestId: string,
        userId: string,
        dto: UpdateProcurementRequestDto,
    ) {

        const request = await this.procurementRequestRepo.findOne({
            where: {
                organizationId,
                id: requestId,
            }
        });

        if (!request) {
            throw new NotFoundException('Procurement request not found');
        }

        if (request.createdById !== userId) {
            throw new ForbiddenException('Only the request creator can update this request!');
        }

        if (request.status !== ProcurementRequestStatus.DRAFT) {
            throw new ConflictException('Only draft requests can be updated.')
        }

        request.title = dto.title ?? request.title
        request.description = dto.description ?? request.description
        request.priority = dto.priority ?? request.priority

        if (dto.neededByDate) {
            request.neededByDate = new Date(dto.neededByDate)
        }

        await this.procurementRequestRepo.save(request);

        if (dto.items) {
            await this.procurementRequestItemRepo.delete({
                procurementRequestId: request.id
            });

            const items = dto.items.map((item) => this.procurementRequestItemRepo.create({
                procurementRequestId: request.id,

                name: item.name,

                description: item.description ?? null,

                quantity: item.quantity.toString(),

                unit: item.unit,

                estimatedUnitPrice: item.estimatedUnitPrice !== undefined ? item.estimatedUnitPrice.toString() : null,

                currency: item.currency ?? null,

                notes: item.notes ?? null,
            }));

            await this.procurementRequestItemRepo.save(items);
        }

        return this.findOne(
            organizationId,
            requestId,
        );
    }

    async submit(
        organizationId: string,
        requestId: string,
        userId: string,
    ) {

        const request = await this.procurementRequestRepo.findOne({
            where: {
                organizationId,
                id: requestId
            },
            relations: {
                items: true
            }
        });

        if (!request) {
            throw new NotFoundException('Procurement request not found!')
        }

        if (request.createdById !== userId) {
            throw new ForbiddenException('Only the request creator can submit this request!')
        }

        if (request.status !== ProcurementRequestStatus.DRAFT) {
            throw new ConflictException('Only draft requests can be submitted!')
        }

        if (!request.items?.length) {
            throw new BadRequestException('Procurement request must contain at least one item.')
        }

        request.status = ProcurementRequestStatus.SUBMITTED;

        request.submittedAt = new Date();

        await this.procurementRequestRepo.save(request);

        return this.findOne(
            organizationId,
            requestId,
        )
    }


    async approve(
        organizationId: string,
        requestId: string,
        approverId: string,
        dto: ApproveProcurementRequestDto,
    ) {

        return this.dataSource.transaction(
            async (manager) => {
                const request = await manager.findOne(
                    ProcurementRequest,
                    {
                        where: {
                            id: requestId,
                            organizationId
                        }
                    }
                );

                if (!request) {
                    throw new NotFoundException('Procurement request not found.')
                }

                if (request.status !== ProcurementRequestStatus.SUBMITTED) {
                    throw new ConflictException('Only submitted requests can be approved.')
                }

                if (request.createdById === approverId) {
                    throw new ForbiddenException('A user cannot approve their own procurement request.')
                }

                request.status = ProcurementRequestStatus.APPROVED

                request.approvedById = approverId

                request.approvedAt = new Date();

                await manager.save(ProcurementRequest, request);

                return request;
            }
        )
    }

    async reject(
        organizationId: string,
        requestId: string,
        rejectorId: string,
        dto: RejectProcurementRequestDto,
    ) {
        const request = await this.procurementRequestRepo.findOne({
            where: {
                organizationId,
                id: rejectorId,
            }
        });

        if (!request) {
            throw new NotFoundException('Procurement request not found');
        }

        if (request.status !== ProcurementRequestStatus.SUBMITTED) {
            throw new ConflictException('Only submitted requests can be rejected.')
        }

        if (request.createdById === rejectorId) {
            throw new ForbiddenException('A user cannot reject their own procurement request.')
        }

        request.status = ProcurementRequestStatus.REJECTED

        request.rejectionReason = dto.reason

        request.rejectedAt = new Date()

        await this.procurementRequestRepo.save(request);

        return this.findOne(
            organizationId,
            requestId
        );
    }

    async cancel(
        organizationId: string,
        requestId: string,
        userId: string,
    ) {

        const request = await this.procurementRequestRepo.findOne({
            where: {
                organizationId,
                id: requestId,
            }
        });

        if (!request) {
            throw new NotFoundException('Procurement request not found!')
        }

        if (request.createdById !== userId) {
            throw new ForbiddenException("Only the request creator can cancel this request")
        }

        if (request.status !== ProcurementRequestStatus.DRAFT && request.status !== ProcurementRequestStatus.SUBMITTED) {
            throw new ConflictException("This request cannot be cancelled.")
        }

        request.status = ProcurementRequestStatus.CANCELETED

        request.cancelledAt = new Date()

        await this.procurementRequestRepo.save(request);

        return this.findOne(
            organizationId,
            requestId
        );
    }

    async deleteRequest(
       organizationId: string,
       requestId: string, 
    ) {
        const request = await this.procurementRequestRepo.findOne({
            where: {
                organizationId,
                id: requestId,
            }
        });

        if (!request) {
            throw new NotFoundException('Procurement request not found!')
        }

        await this.procurementRequestRepo.remove(request)

        return {
            message: 'Procurement request deleted successully'
        }
    }
}
