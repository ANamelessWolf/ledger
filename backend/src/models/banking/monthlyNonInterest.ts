import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { Creditcard } from "../ledger";
import { Expense } from "../expenses";

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

  get creditcard(): Promise<Creditcard[]> {
    const options = {
      where: [{ id: this.creditcardId }],
    };
    return AppDataSource.manager.find(Creditcard, options);
  }

  get expense(): Promise<Expense[]> {
    const options = {
      where: [{ id: this.expenseId }],
    };
    return AppDataSource.manager.find(Expense, options);
  }
}
