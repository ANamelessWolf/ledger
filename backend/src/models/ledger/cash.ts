import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { AppDataSource } from "../../index";
import { Wallet } from "./wallet";

@Entity('Cash', { database: process.env.DB_NAME })
export class Cash {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "int" })
  total: number;

  @Column({ type: "int" })
  active: number;

  get currency(): Promise<Wallet[]> {
    const options = {
      where: [{ id: this.walletId }],
    };
    return AppDataSource.manager.find(Wallet, options);
  }

}
