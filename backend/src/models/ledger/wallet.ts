import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Currency, Owner } from "../settings";
import { WalletType } from "../catalogs";
import { getObject } from "../../utils/dbUtils";

@Entity("Wallet", { database: process.env.DB_NAME })
export class Wallet {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "owner_id" })
  ownerId: number;

  @Column({ type: "int", name: "wallet_type_id" })
  walletTypeId: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: "varchar", length: 40 })
  name: string;

  get owner() {
    return getObject(Owner, this.ownerId);
  }

  get walletType() {
    return getObject(WalletType, this.walletTypeId);
  }

  get currency() {
    return getObject(Currency, this.currencyId);
  }
}
