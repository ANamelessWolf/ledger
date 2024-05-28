import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { Currency, Owner } from "../settings";
import { AppDataSource } from "../../index";

@Entity('Investment', { database: process.env.DB_NAME })
export class Investment {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "owner_id" })
  ownerId: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: 'varchar', length: 20 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: "double", name: "interest_rate" })
  interestRate: number;

  @Column({ type: "double" })
  total: number;

  get owner(): Promise<Owner[]> {
    const options = {
      where: [{ id: this.ownerId }],
    };
    return AppDataSource.manager.find(Owner, options);
  }

  get currency(): Promise<Currency[]> {
    const options = {
      where: [{ id: this.currencyId }],
    };
    return AppDataSource.manager.find(Currency, options);
  }

}
