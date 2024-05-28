import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { Wallet } from "../ledger";
import { ExpenseType, Vendor } from "../catalogs";

@Entity("Expense", { database: process.env.DB_NAME })
export class Expense {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "wallet_id" })
  walletId: number;

  @Column({ type: "int", name: "expense_type_id" })
  expenseTypeId: number;

  @Column({ type: "int", name: "vendor_id" })
  vendorId: number;

  @Column({ type: "varchar", length: 120 })
  description: string;

  @Column({ type: "double" })
  total: number;

  @Column({ type: "date", name: "buy_date" })
  buyDate: Date;

  get expenseType(): Promise<ExpenseType[]> {
    const options = {
      where: [{ id: this.expenseTypeId }],
    };
    return AppDataSource.manager.find(ExpenseType, options);
  }

  get vendor(): Promise<Vendor[]> {
    const options = {
      where: [{ id: this.vendorId }],
    };
    return AppDataSource.manager.find(Vendor, options);
  }

  get wallet(): Promise<Wallet[]> {
    const options = {
      where: [{ id: this.walletId }],
    };
    return AppDataSource.manager.find(Wallet, options);
  }

}
