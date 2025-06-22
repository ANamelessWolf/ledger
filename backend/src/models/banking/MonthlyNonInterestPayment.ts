import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Expense } from "../expenses";
import { getObject } from "../../utils/dbUtils";
import { MonthlyNonInterest } from "./monthlyNonInterest";

@Entity("monthly_with_no_interest_payments", { database: process.env.DB_NAME })
export class MonthlyNonInterestPayment {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "monthly_buy_id" })
  buyId: number;

  @Column({ type: "int", name: "expense_id" })
  expenseId: number;

  @Column({ type: "int", name: "is_paid" })
  isPaid: number;

  get monthlyBuy() {
    return getObject(MonthlyNonInterest, this.buyId);
  }

  get expense() {
    return getObject(Expense, this.expenseId);
  }

}
