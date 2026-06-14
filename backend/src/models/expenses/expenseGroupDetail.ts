import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("expense_group_detail", { database: process.env.DB_NAME })
export class ExpenseGroupDetail {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "group_id" })
  groupId: number;

  @Column({ type: "int", name: "expense_id" })
  expenseId: number;
}
