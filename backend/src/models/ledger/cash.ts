import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Wallet } from "./wallet";
import { getObject } from "../../utils/dbUtils";

@Entity("Cash", { database: process.env.DB_NAME })
export class Cash {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "int" })
  total: number;

  @Column({ type: "int" })
  active: number;

  get wallet() {
    return getObject(Wallet, this.walletId);
  }
}
