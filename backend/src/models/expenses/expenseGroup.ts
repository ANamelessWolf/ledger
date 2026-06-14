import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("expense_group", { database: process.env.DB_NAME })
export class ExpenseGroup {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  description: string | null;

  @Column({ type: "varchar", length: 30, nullable: true })
  icon: string | null;
}
