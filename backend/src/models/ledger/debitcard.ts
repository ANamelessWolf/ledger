import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Saving } from "./saving";
import { getObject } from "../../utils/dbUtils";

@Entity("Debit_Card", { database: process.env.DB_NAME })
export class Debitcard {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "saving_id" })
  savingId: number;

  @Column({ type: "double", name: "cut_day" })
  cutDay: number;
  
  @Column({ type: "varchar", length: 5 })
  ending: string;

  @Column({ type: "varchar", length: 7 })
  expiration: string;

  @Column({ type: "int", name: "card_type" })
  cardType: number;

  @Column({ type: "varchar", length: 12 })
  color: string;

  @Column({ type: "int", name: "active" })
  active: number;

  get saving(){
    return getObject(Saving, this.savingId);
  }
  
}
