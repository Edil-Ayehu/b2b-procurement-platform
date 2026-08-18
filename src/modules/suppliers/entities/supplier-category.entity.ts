import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { Organization } from "../../organizations/entities/organization.entity"
import { Supplier } from "./supplier.entity"

@Entity('supplier_categories')
@Index([ 'organizationId', 'name'], { unique: true})
export class SupplierCategory {
    @PrimaryGeneratedColumn('uuid')
    id!: string
    
    @Index()
    @Column()
    organizationId!: string

    @ManyToOne(() => Organization, { onDelete: 'CASCADE'})
    @JoinColumn({name: 'organizationId'})
    organization!: Organization

    @Column({ length: 100 })   
    name!: string

    @Column({type: 'text', nullable: true})
    description!: string | null

    @Column({default: true})
    isActive!: boolean

    @OneToMany(() => Supplier, (supplier) => supplier.category) 
    suppliers!: Supplier[]

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date
}