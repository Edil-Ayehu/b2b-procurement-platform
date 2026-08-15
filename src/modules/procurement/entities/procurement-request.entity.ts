import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { User } from "../../users/entities/user.entity";
import { ProcurementRequestStatus } from "../enums/procurement-request-status.enum";
import { ProcurementRequestPriority } from "../enums/procurement-request-priority.enum";
import { ProcurementRequestItem } from "./procurement-request-item.entity";

@Entity('procurement_requests')
export class ProcurementRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Index()
    @Column()
    organizationId!: string;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE'})
    @JoinColumn({name: 'organizationId'})
    organization!: Organization

    @Index()
    @Column()
    createdById!: string

    @ManyToOne(() => User, { 
        nullable: true,
        onDelete: 'SET NULL'
    })
    @JoinColumn({name: 'createdById'})
    createdBy!: User

    @Index()
    @Column({ nullable: true})
    approvedById!: string | null

    @ManyToOne(() => User, { onDelete: 'RESTRICT'})
    @JoinColumn({name: 'approvedById'})
    approvedBy!: User | null

    @Column({length: 200})
    title?: string

    @Column({
        type: 'text',
        nullable: true,
    })
    description!: string | null

    @Column({
        type: 'enum',
        enum: ProcurementRequestStatus,
        default: ProcurementRequestStatus.DRAFT,
    })
    status!: ProcurementRequestStatus

    @Column({
        type: 'enum',
        enum: ProcurementRequestPriority,
        default: ProcurementRequestPriority.NORMAL,
    })
    priority!: ProcurementRequestPriority

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    neededByDate!: Date | null

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    submittedAt!: Date | null

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    approvedAt!: Date | null

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    rejectedAt!: Date | null

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    cancelledAt!: Date | null

    @Column({
        type: 'text',
        nullable: true
    })
    rejectionReason!: string | null

    @OneToMany(() => ProcurementRequestItem, (item) => item.procurementRequest, { cascade: true})
    items!: ProcurementRequestItem[]

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}