
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('Payment_Frequency', { database: process.env.DB_NAME })
export class PaymentFrequency {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'varchar', length: 45 })
  name: string;

  @Column({ type: 'int'})
  months: number;

  @Column({ type: 'int'})
  years: number;

}
