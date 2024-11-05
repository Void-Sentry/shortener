import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UrlEntity } from "./url.entity";

@Entity('clicks')
export class ClickEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    clickedAt: Date;

    @Column({ type: 'varchar', length: 255, nullable: false })
    userAgent: string;

    @Column({ type: 'varchar', length: 45, nullable: false })
    ipAddress: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    referrer: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    country: string;

    @ManyToOne(() => UrlEntity, (url) => url.id, { onDelete: 'CASCADE' })
    url: UrlEntity;
}