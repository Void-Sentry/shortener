import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('urls')
export class UrlEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255, nullable: false })
    shortCode: string;

    @Column({ type: 'text', nullable: false })
    originalUrl: string;

    @Column({ type: 'bigint', nullable: true })
    userId?: number;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    expiredAt: Date;
}