import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('cat_wallet_type', { database: process.env.DB_NAME })
export class WalletType {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'varchar', length: 40 })
  description: string;
}
