import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { Creditcard } from "./creditcard";

@Entity("Credit_Card_Payment", { database: process.env.DB_NAME })
export class CreditcardPayment {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "credit_card_id" })
  creditcardId: number;

  @Column({ type: "double", name: "payment_total" })
  paymentTotal: number;

  @Column({ type: "date", name: "payment_date" })
  paymentDate: string;

  @Column({ type: "date", name: "period_cut_date" })
  paymentCutDate: string;

  @Column({ type: "date", name: "period_due_date" })
  paymentDueDate: string;

  get creditcard(): Promise<Creditcard[]> {
    const options = {
      where: [{ id: this.creditcardId }],
    };
    return AppDataSource.manager.find(Creditcard, options);
  }

}
