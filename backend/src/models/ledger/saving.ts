import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { Wallet } from "./wallet";
import { FinancingEntity } from "../banking/financingEntity";
import { getObject } from "../../utils/dbUtils";

@Entity('saving', { database: process.env.DB_NAME })
export class Saving {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "preferred_wallet_id" })
  preferredWalletId: number;

  @Column({ type: "int", name: "wallet_group_id", nullable: true })
  walletGroupId: number | null;

  @Column({ type: "int", name: "entity_id" })
  entityId: number;

  @Column({ type: "int", name: "financing_account_id" })
  financingAccountId: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: "double", default: 0 })
  balance: number;

  get wallet(): Promise<Wallet | null> {
    return getObject(Wallet, this.preferredWalletId);
  }

  get financingEntity(): Promise<FinancingEntity | null> {
    return getObject(FinancingEntity, this.entityId);
  }
}
