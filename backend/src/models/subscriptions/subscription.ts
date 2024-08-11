import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Wallet } from "../ledger";
import { Currency, PaymentFrequency } from "../settings";
import { getObject } from "../../utils/dbUtils";

@Entity("Subscription", { database: process.env.DB_NAME })
export class Subscription {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: "int", name: "payment_frequency_id" })
  paymentFrequencyId: number;

  @Column({ type: "varchar", length: 40 })
  name: string;

  @Column({ type: "double" })
  price: number;

  @Column({ type: "int" })
  active: number;

  @Column({ type: "int", name: "charge_day" })
  chargeDay: number;

  @Column({ type: "date", name: "last_payment_date" })
  lastPaymentDate: Date;

  get currency() {
    return getObject(Currency, this.currencyId);
  }

  get paymentFrequency() {
    return getObject(PaymentFrequency, this.currencyId);
  }

  get wallet() {
    return getObject(Wallet, this.walletId);
  }
}
