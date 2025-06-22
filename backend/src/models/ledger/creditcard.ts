import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { FinancingEntity } from "../banking/financingEntity";
import { Wallet } from "./wallet";
import { CreditcardPayment } from "./creditcardPayment";
import { getObject } from "../../utils/dbUtils";
import { WalletGroup } from "./walletGroup";

@Entity("Credit_Card", { database: process.env.DB_NAME })
export class Creditcard {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "entity_id" })
  entityId: number;

  @Column({ type: "int", name: "preferred_wallet_id" })
  preferredWalletId: number;

  @Column({ type: "int", name: "wallet_group_id" })
  walletGroupId: number;

  @Column({ type: "double" })
  credit: number;

  @Column({ type: "double", name: "use_credit" })
  usedCredit: number;

  @Column({ type: "int", name: "cut_day" })
  cutDay: number;

  @Column({ type: "int", name: "days_to_pay" })
  daysToPay: number;

  @Column({ type: "varchar", length: 7 })
  expiration: string;

  @Column({ type: "int", name: "card_type" })
  cardType: number;

  @Column({ type: "varchar", length: 5 })
  ending: string;

  @Column({ type: "varchar", length: 12 })
  color: string;

  @Column({ type: "int", name: "active" })
  active: number;

  get financingEntity() {
    return getObject(FinancingEntity, this.entityId);
  }

  get preferredWallet() {
    return getObject(Wallet, this.preferredWalletId);
  }

  get walletGroup() {
    return getObject(WalletGroup, this.walletGroupId);
  }

  get payments() {
    const options: any = {
      order: {
        paymentDate: "DESC",
      },
      take: 5,
      where: [{ creditcardId: this.id }],
    };
    return AppDataSource.manager.find(CreditcardPayment, options);
  }
}
