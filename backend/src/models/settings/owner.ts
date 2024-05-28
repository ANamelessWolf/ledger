import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { Currency } from "./currency";
import { AppDataSource } from "../../index";

@Entity('Owner', { database: process.env.DB_NAME })
export class Owner {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "currency_id" })
  currencyId: number;

  @Column({ type: 'varchar', length: 120 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  username: string;

  @Column({ type: 'varchar', length: 200 })
  fullname: string;

  get currency(): Promise<Currency[]> {
    const options = {
      where: [{ id: this.currencyId }],
    };
    return AppDataSource.manager.find(Currency, options);
  }

}
