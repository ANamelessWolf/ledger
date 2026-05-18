import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { FinancingType } from "../catalogs/financingType";
import { getObject } from "../../utils/dbUtils";

@Entity('financing_account', { database: process.env.DB_NAME })
export class FinancingAccount {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "int", name: "financing_type_id", nullable: true })
  financingTypeId: number;

  @Column({ type: 'varchar', length: 45 })
  name: string;

  @Column({ type: 'varchar', length: 250, default: 'Cuenta financiera' })
  description: string;

  get financingType() {
    return getObject(FinancingType, this.financingTypeId);
  }
}
