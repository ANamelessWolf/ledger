import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

// item_type: 1 = CAT_Expense_Type, 2 = CAT_Vendor
@Entity("budget_item_detail", { database: process.env.DB_NAME })
export class BudgetItemDetail {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "budget_id" })
  budgetId: number;

  @Column({ type: "tinyint", name: "item_type" })
  itemType: number;

  @Column({ type: "int", name: "item_id" })
  itemId: number;
}
