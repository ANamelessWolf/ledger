import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Wallet } from "../ledger";
import { ExpenseType, Vendor } from "../catalogs";
import { getObject } from "../../utils/dbUtils";

@Entity("expense", { database: process.env.DB_NAME })
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

  /**
   * Optional expense-specific conversion factor to the default currency
   * (default-currency units per 1 unit of the wallet currency). NULL in the
   * database when the current catalog conversion applies.
   */
  @Column({ type: "double", name: "currency_factor", nullable: true })
  currencyFactor: number | null;

  @Column({ type: "date", name: "buy_date" })
  buyDate: Date;

  @Column({ type: "int", name: "sort_id" })
  sortId: number;

  get expenseType(){
    return getObject(ExpenseType, this.expenseTypeId);
  }

  get vendor(){
    return getObject(Vendor, this.vendorId);
  }

  get wallet(){
    return getObject(Wallet, this.walletId);
  }

}
