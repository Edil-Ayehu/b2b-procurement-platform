import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Supplier } from "./supplier.entity";

@Entity('supplier_contacts')
@Index(['supplierId', 'email'], { unique: true })
export class SupplierContact {

    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Index()
    @Column()
    supplierId!: string

    @ManyToOne(() => Supplier, (supplier) => supplier.contacts, { onDelete: 'CASCADE'})
    @JoinColumn({ name: 'supplierId'})
    supplier!: Supplier;

    @Column({
    length: 100,
    })
    firstName!: string;

   @Column({
    length: 100,
    })
    lastName!: string;

   @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
   })
   jobTitle!: string | null;

   @Column({
    length: 150,
   })
   email!: string;

   @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
   })
   phone!: string | null;

   @Column({
    default: false,
  })
  isPrimary!: boolean;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}