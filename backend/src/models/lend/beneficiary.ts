import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Owner } from "../settings";
import { getObject } from "../../utils/dbUtils";

@Entity("beneficiary", { database: process.env.DB_NAME })
export class Beneficiary {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "owner_id" })
  ownerId: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  get owner() {
    return getObject(Owner, this.ownerId);
  }
}
