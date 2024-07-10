import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("Wallet_Group", { database: process.env.DB_NAME })
export class WalletGroup {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", length: 40 })
  name: string;
}
