import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { FinancingEntity } from "../banking/financingEntity";
import { Wallet } from "./wallet";
import { CreditcardPayment } from "./creditcardPayment";

@Entity("Credit_Card", { database: process.env.DB_NAME })
export class Creditcard {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "entity_id" })
  entityId: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "double" })
  credit: number;

  @Column({ type: "double", name: "use_credit" })
  usedCredit: number;

  @Column({ type: "int", name: "cut_day" })
  cutDay: number;

  @Column({ type: "int", name: "due_day" })
  dueDay: number;

  @Column({ type: "varchar", length: 7 })
  expiration: string;

  @Column({ type: "int", name: "card_type" })
  cardType: number;

  @Column({ type: "varchar", length: 5 })
  ending: string;

  @Column({ type: "varchar", length: 12 })
  color: string;

  get financingEntity(): Promise<FinancingEntity[]> {
    const options = {
      where: [{ id: this.entityId }],
    };
    return AppDataSource.manager.find(FinancingEntity, options);
  }

  get wallet(): Promise<Wallet[]> {
    const options = {
      where: [{ id: this.walletId }],
    };
    return AppDataSource.manager.find(Wallet, options);
  }

  get payments(): Promise<CreditcardPayment[]> {
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
