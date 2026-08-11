import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity('user_sessions')
export class UserSession {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @Column()
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE'})
    @JoinColumn({ name: 'userId'})
    user!: User;

    @Column()
    refreshTokenHash!: string;

    @Column({ type: 'varchar', nullable: true })
    deviceName!: string | null;

    @Column( { type: 'varchar', nullable: true })
    userAgent!: string | null;

    @Column({ type: 'varchar', nullable: true})
    ipAddress!: string | null;

    @Column()
    expiresAt!: Date;

    @Column({ type: 'timestamp', nullable: true})
    revokedAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}