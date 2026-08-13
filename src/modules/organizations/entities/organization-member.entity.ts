import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToMany, ManyToOne, Or, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Organization } from "./organization.entity";
import { User } from "../../users/entities/user.entity";
import { OrganizationRole } from "../enums/organization-role.enum";

@Entity('organization_members')
@Unique([
    'organizationId',
    'userId',
])
export class OrganizationMember {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Index()
    @Column()
    organizationId!: string

    @Index()
    @Column()
    userId!: string;

    @ManyToOne(() => Organization, { onDelete: 'CASCADE'})
    @JoinColumn({name: 'organizationId'})
    organization!: Organization

    @ManyToOne(() => User, { onDelete: 'CASCADE'})
    @JoinColumn({name: 'userId'})
    user!: User

    @Column({
        type: 'enum',
        enum: OrganizationRole,
    })
    role!: OrganizationRole

    @Column({
        default: true,
    })
    isActive!: boolean

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}