import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "../../index";
import { Owner } from "../settings";

@Entity("Beneficiary", { database: process.env.DB_NAME })
export class Beneficiary {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "owner_id" })
  ownerId: number;

  @Column({ type: "varchar", length: 100 })
  name: string;

  get owner(): Promise<Owner[]> {
    const options = {
      where: [{ id: this.ownerId }],
    };
    return AppDataSource.manager.find(Owner, options);
  }

}
