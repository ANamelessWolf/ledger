import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { Subscription } from "./subscription";

@Entity("SubscriptionPaymentHistory", { database: process.env.DB_NAME })
export class SubscriptionPaymentHistory {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "subscription_id" })
  subscriptionId: number;

  @Column({ type: "double" })
  total: number;

  @Column({ type: "double", name: "exchange_rate" })
  exchangeRate: number;
  
  @Column({ type: "date", name: "payment_date" })
  paymentDate: Date;

  get subscription(): Promise<Subscription[]> {
    const options = {
      where: [{ id: this.subscriptionId }],
    };
    return AppDataSource.manager.find(Subscription, options);
  }

}
