import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("subscription_payment_history", { database: process.env.DB_NAME })
export class SubscriptionPaymentHistory {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "subscription_id" })
  subscriptionId: number;

  @Column({ type: "int", name: "expense_id" })
  expenseId: number;
}
