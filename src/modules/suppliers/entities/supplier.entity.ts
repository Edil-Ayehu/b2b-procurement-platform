import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { SupplierCategory } from "./supplier-category.entity";
import { SupplierType } from "../enums/supplier-type.enum";
import { SupplierStatus } from "../enums/supplier-status-enum";
import { SupplierContact } from "./supplier-contact.entity";

@Entity('suppliers')
@Index(['organizationId', 'name'], { unique: true })
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Index()
    @Column()
    organizationId!: string;

    @ManyToOne(()=> Organization, { onDelete: 'CASCADE'} )
    @JoinColumn({ name: 'organizationId'} )
    organization!: Organization

    @Index()
    @Column()
    categoryId!: string

    @ManyToOne(() => SupplierCategory, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'categoryId' })
    category!:SupplierCategory

    @Column({length: 200})
    name!: string

    @Column({
        type: 'enum',
        enum: SupplierType,
        default: SupplierType.COMPANY,
    })
    type!: SupplierType

    @Column({
        type: 'varchar',
        nullable: true,
        length: 100
    })
    registrationNumber!: string | null

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    taxIdentificationNumber!: string | null

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    industry!: string | null

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    country!: string | null

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    city!: string | null

    @Column({
        type: 'text',
        nullable: true,
    })
    address!: string | null

    @Column({
        type: 'varchar',
        length: 30,
        nullable: true,
    })
    phone!: string | null

    @Column({
        type: 'varchar',
        length: 150,
        nullable: true,
    })
    email!: string | null

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    website!: string | null

    @Column({
        type: 'enum',
        enum: SupplierStatus,
        default: SupplierStatus.ACTIVE,
    })
    status!: SupplierStatus

    @Column({
        type: 'text',
        nullable: true,
    })
    notes!: string | null

    @OneToMany(() => SupplierContact, (contact) => contact.supplier, { cascade: true})
    contacts!: SupplierContact[]

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}