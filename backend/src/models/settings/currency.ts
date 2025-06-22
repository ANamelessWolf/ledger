import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('currency', { database: process.env.DB_NAME })
export class Currency {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: 'varchar', length: 20 })
  name: string;

  @Column({ type: 'varchar', length: 3 })
  symbol: string;

  @Column({ type: 'double'})
  conversion: number;

}
