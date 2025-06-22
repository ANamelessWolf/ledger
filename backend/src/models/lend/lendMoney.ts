import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Expense } from "../expenses";
import { Beneficiary } from "./beneficiary";
import { Owner, PaymentFrequency } from "../settings";
import { getObject } from "../../utils/dbUtils";

@Entity("lend_money", { database: process.env.DB_NAME })
export class LendMoney {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "owner_id" })
  ownerId: number;

  @Column({ type: "int", name: "expense_id" })
  expenseId: number;

  @Column({ type: "int", name: "beneficiary_id" })
  beneficiaryId: number;

  @Column({ type: "int", name: "payment_frequency_id" })
  paymentFrequencyId: number;

  @Column({ type: "double" })
  total: number;

  @Column({ type: "double", name: "interest_rate" })
  interest: number;

  @Column({ type: "double" })
  paid: number;

  @Column({ type: "date", name: "last_payment_date" })
  lastPaymentDate: Date;

  get owner() {
    return getObject(Owner, this.ownerId);
  }

  get expense() {
    return getObject(Expense, this.expenseId);
  }

  get beneficiary() {
    return getObject(Beneficiary, this.beneficiaryId);
  }

  get paymentFrequency() {
    return getObject(PaymentFrequency, this.paymentFrequencyId);
  }
}
