import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Subscription } from "./subscription";
import { getObject } from "../../utils/dbUtils";

@Entity("subscription_payment_history", { database: process.env.DB_NAME })
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

  get subscription() {
    return getObject(Subscription, this.subscriptionId);
  }
  
}
