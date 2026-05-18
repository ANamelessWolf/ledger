import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('investments', { database: process.env.DB_NAME })
export class Investment {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: "int", name: "financing_account_id" })
  financingAccountId: number;

  @Column({ type: 'varchar', length: 45, nullable: true })
  balance: string | null;
}
