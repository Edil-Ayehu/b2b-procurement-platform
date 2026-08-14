import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProcurementRequest } from "./procurement-request.entity";

@Entity('procurement_request_items')
export class ProcurementRequestItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    procurementRequestId!: string

    @ManyToOne(() => ProcurementRequest,(request) => request.items,  { onDelete: 'CASCADE'})
    @JoinColumn({ name: 'procurementRequestId'})
    procurementRequest!: ProcurementRequest

    @Column({
        length: 200
    })
    name!: string

    @Column({
        type: 'text',
        nullable: true,
    })
    description!: string | null

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
    })
    quantity!: string

    @Column({
        length: 50,
    })
    unit!: string;

    @Column({
        type: 'decimal',
        precision: 14,
        scale: 2,
        nullable: true,
    })
    estimatedUnitPrice!: string | null

    @Column({
        length: 3,
        nullable: true,
    })
    currency!: string | null;

    @Column({
        type: 'text',
        nullable: true,
    })
    notes!: string | null;
}