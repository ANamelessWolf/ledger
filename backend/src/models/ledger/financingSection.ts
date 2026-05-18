import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('financing_section', { database: process.env.DB_NAME })
export class FinancingSection {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "financing_account_id" })
  financingAccountId: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: 'varchar', length: 45 })
  name: string;

  @Column({ type: "double", default: 0 })
  balance: number;

  @Column({ type: "tinyint", name: "is_investment", default: 0 })
  isInvestment: number;

  @Column({ type: "tinyint", name: "is_locked", default: 0 })
  isLocked: number;

  @Column({ type: "tinyint", name: "is_available", default: 1 })
  isAvailable: number;

  @Column({ type: "double", name: "investment_rate", nullable: true })
  investmentRate: number | null;

  @Column({ type: "date", name: "investment_start_date", nullable: true })
  investmentStartDate: Date | null;

  @Column({ type: "date", name: "investment_end_date", nullable: true })
  investmentEndDate: Date | null;
}
