import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { Wallet } from "../ledger";
import { Currency, PaymentFrequency } from "../settings";

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

  get currency(): Promise<Currency[]> {
    const options = {
      where: [{ id: this.currencyId }],
    };
    return AppDataSource.manager.find(Currency, options);
  }

  get paymentFrequency(): Promise<PaymentFrequency[]> {
    const options = {
      where: [{ id: this.paymentFrequencyId  }],
    };
    return AppDataSource.manager.find(PaymentFrequency, options);
  }

  get wallet(): Promise<Wallet[]> {
    const options = {
      where: [{ id: this.walletId }],
    };
    return AppDataSource.manager.find(Wallet, options);
  }

}
