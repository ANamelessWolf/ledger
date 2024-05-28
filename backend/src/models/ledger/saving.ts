import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { AppDataSource } from "../../index";
import { Wallet } from "./wallet";
import { FinancingEntity } from "../banking/financingEntity";

@Entity('Saving', { database: process.env.DB_NAME })
export class Saving {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "int", name: "entity_id" })
  entityId: number;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: "double", name: "interest_rate" })
  interestRate: number;

  @Column({ type: "double" })
  total: number;

  get wallet(): Promise<Wallet[]> {
    const options = {
      where: [{ id: this.walletId }],
    };
    return AppDataSource.manager.find(Wallet, options);
  }

  get financyEntity(): Promise<FinancingEntity[]> {
    const options = {
      where: [{ id: this.entityId }],
    };
    return AppDataSource.manager.find(FinancingEntity, options);
  }

}
