import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("budget", { database: process.env.DB_NAME })
export class Budget {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "owner_id", default: 1 })
  ownerId: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: "varchar", length: 100 })
  description: string;

  @Column({ type: "varchar", length: 30, nullable: true })
  icon: string;

  @Column({ type: "double" })
  total: number;
}
