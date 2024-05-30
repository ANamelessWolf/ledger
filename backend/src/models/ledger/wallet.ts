import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { Currency, Owner } from "../settings";
import { AppDataSource } from "../../index";
import { WalletType } from "../catalogs";

@Entity('Wallet', { database: process.env.DB_NAME })
export class Wallet {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "owner_id" })
  ownerId: number;

  @Column({ type: "int", name: "wallet_type_id" })
  walletTypeId: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: 'varchar', length: 40 })
  name: string;

  get owner(): Promise<Owner[]> {
    const options = {
      where: [{ id: this.ownerId }],
    };
    return AppDataSource.manager.find(Owner, options);
  }

  get walletType(): Promise<WalletType[]> {
    const options = {
      where: [{ id: this.walletTypeId }],
    };
    return AppDataSource.manager.find(WalletType, options);
  }

  get currency(): Promise<Currency[]> {
    const options = {
      where: [{ id: this.currencyId }],
    };
    return AppDataSource.manager.find(Currency, options);
  }

}
