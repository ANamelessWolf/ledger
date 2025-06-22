import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('cat_vendor', { database: process.env.DB_NAME })
export class Vendor {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'varchar', length: 45 })
  description: string;

}
