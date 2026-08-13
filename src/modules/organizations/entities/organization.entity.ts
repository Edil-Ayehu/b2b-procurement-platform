import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 150 })
    name!: string

    @Column({ unique: true, length: 100 })
    slug!: string

    @Column({
        type: 'varchar',
        nullable: true,
        length: 255,
    })
    description!: string | null;

    @Column({
        default: true,
    })
    isActive!: boolean

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}