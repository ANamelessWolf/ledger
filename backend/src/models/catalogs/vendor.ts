import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('CAT_Vendor', { database: process.env.DB_NAME })
export class Vendor {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'varchar', length: 45 })
  description: string;

}
