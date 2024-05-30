import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { Expense } from "../expenses";
import { Beneficiary } from "./beneficiary";
import { Owner, PaymentFrequency } from "../settings";

@Entity("Lend_Money", { database: process.env.DB_NAME })
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

  get owner(): Promise<Owner[]> {
    const options = {
      where: [{ id: this.ownerId }],
    };
    return AppDataSource.manager.find(Owner, options);
  }

  get expense(): Promise<Expense[]> {
    const options = {
      where: [{ id: this.expenseId }],
    };
    return AppDataSource.manager.find(Expense, options);
  }

  get beneficiary(): Promise<Beneficiary[]> {
    const options = {
      where: [{ id: this.beneficiaryId }],
    };
    return AppDataSource.manager.find(Beneficiary, options);
  }

  get paymentFrequency(): Promise<PaymentFrequency[]> {
    const options = {
      where: [{ id: this.paymentFrequencyId  }],
    };
    return AppDataSource.manager.find(PaymentFrequency, options);
  }

}
