import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { Wallet } from "../ledger";
import { PaymentFrequency } from "../settings";

@Entity("Credit", { database: process.env.DB_NAME })
export class Credit {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "payment_frequency_id" })
  paymentFrequencyId: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "varchar", length: 500 })
  description: string;

  @Column({ type: "double" })
  total: number;

  @Column({ type: "int", name: "current_payments" })
  currentPayments: number;

  @Column({ type: "int", name: "total_payments" })
  totalPayments: number;

  @Column({ type: "date", name: "last_payment" })
  lastPayment: Date;

  @Column({ type: "double", name: "interest_rate" })
  interest: number;

  @Column({ type: "double", name: "paid" })
  paid: number;

  @Column({ type: "double", name: "pay_rate" })
  payRate: number;

  @Column({ type: "double", name: "remaining_payment" })
  remaining: number;

  get paymentFrequency(): Promise<PaymentFrequency[]> {
    const options = {
      where: [{ id: this.paymentFrequencyId }],
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
