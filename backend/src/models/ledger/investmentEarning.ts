import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('investment_earnings', { database: process.env.DB_NAME })
export class InvestmentEarning {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "financing_account_id" })
  financingAccountId: number;

  @Column({ type: "int", name: "financing_section_id" })
  financingSectionId: number;

  @Column({ type: "double" })
  total: number;

  @Column({ type: "date", name: "investment_end_date" })
  investmentEndDate: Date;
}
