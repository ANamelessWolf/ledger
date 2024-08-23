import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Creditcard } from "../ledger";
import { Expense } from "../expenses";
import { getObject } from "../../utils/dbUtils";
import { MonthlyNonInterestPayment } from "./MonthlyNonInterestPayment";
import { AppDataSource } from "../..";

@Entity("Monthly_With_No_Interest", { database: process.env.DB_NAME })
export class MonthlyNonInterest {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "credit_card_id" })
  creditcardId: number;

  @Column({ type: "int", name: "expense_id" })
  expenseId: number;

  @Column({ type: "date", name: "start_date" })
  startDate: Date;

  @Column({ type: "int", name: "months" })
  months: number;

  @Column({ type: "int", name: "paid_months" })
  paidMonths: number;

  @Column({ type: "int" })
  archived: number;

  get creditcard() {
    return getObject(Creditcard, this.creditcardId);
  }

  get expense() {
    return getObject(Expense, this.expenseId);
  }

  get payments(): Promise<MonthlyNonInterestPayment[]> {
    const filter: any = {
      where: [{ buyId : this.id }],
    };
    return AppDataSource.manager.find(MonthlyNonInterestPayment, filter);
  }
}
