import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('CAT_Financing_Type', { database: process.env.DB_NAME })
export class FinancingType {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'varchar', length: 100 })
  description: string;

}
