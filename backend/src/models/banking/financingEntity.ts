import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { FinancingType } from "../catalogs";
import { AppDataSource } from "../../index";

@Entity("Financing_Entity", { database: process.env.DB_NAME })
export class FinancingEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "financing_type_id" })
  financingTypeId: number;

  @Column({ type: "varchar", length: 20 })
  name: string;

  get financingType(): Promise<FinancingType[]> {
    const options = {
      where: [{ id: this.financingTypeId }],
    };
    return AppDataSource.manager.find(FinancingType, options);
  }
}
