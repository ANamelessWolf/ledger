import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { FinancingType } from "../catalogs";
import { getObject } from "../../utils/dbUtils";

@Entity("financing_entity", { database: process.env.DB_NAME })
export class FinancingEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "financing_type_id" })
  financingTypeId: number;

  @Column({ type: "varchar", length: 20 })
  name: string;

  get financingType() {
    return getObject(FinancingType, this.financingTypeId);
  }
}
