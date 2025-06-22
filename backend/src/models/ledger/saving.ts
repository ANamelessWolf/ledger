import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { Wallet } from "./wallet";
import { FinancingEntity } from "../banking/financingEntity";
import { getObject } from "../../utils/dbUtils";

@Entity('saving', { database: process.env.DB_NAME })
export class Saving {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "int", name: "entity_id" })
  entityId: number;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: "double", name: "interes_rate" })
  interestRate: number;

  @Column({ type: "double" })
  total: number;

  get wallet(){
    return getObject(Wallet,this.walletId);
  }

  get financingEntity(){
    return getObject(FinancingEntity,this.entityId);
  }

}
