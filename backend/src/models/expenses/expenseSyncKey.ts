import { Entity, Column, PrimaryColumn } from "typeorm";

/**
 * Idempotency key that links a mobile-generated `syncKey` to the expense it
 * created. See migration `051_create_table_expense_sync_key.sql`.
 */
@Entity("expense_sync_key", { database: process.env.DB_NAME })
export class ExpenseSyncKey {
  /** Stable client-generated key (UUID) sent by the mobile app. */
  @PrimaryColumn({ type: "varchar", length: 64, name: "sync_key" })
  syncKey: string;

  /** Id of the expense created for this key. */
  @Column({ type: "int", name: "expense_id" })
  expenseId: number;

  /** Server-generated creation timestamp. */
  @Column({ type: "timestamp", name: "created_at", insert: false, update: false })
  createdAt: Date;
}
