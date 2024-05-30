import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('CAT_Wallet_Type', { database: process.env.DB_NAME })
export class WalletType {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'varchar', length: 40 })
  description: string;
}
