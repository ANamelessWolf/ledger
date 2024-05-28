import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('CAT_Expense_Type', { database: process.env.DB_NAME })
export class ExpenseType {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'varchar', length: 100 })
  description: string;

}
