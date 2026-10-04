import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

/**
 * Durable diagnostic record written for every request item of a failed
 * mobile sync batch. See migration `052_create_table_expense_sync_error_log.sql`.
 */
@Entity("expense_sync_error_log", { database: process.env.DB_NAME })
export class ExpenseSyncErrorLog {
  @PrimaryGeneratedColumn("increment")
  id: number;

  /** Sync key of the failed item, when the item carried a usable one. */
  @Column({ type: "varchar", length: 64, name: "sync_key", nullable: true })
  syncKey: string | null;

  /** The raw request item, serialized as JSON. */
  @Column({ type: "json", name: "request_body" })
  requestBody: unknown;

  /** Database/driver error code (e.g. `ER_NO_REFERENCED_ROW_2`) or a validation code. */
  @Column({ type: "varchar", length: 64, name: "error_code", nullable: true })
  errorCode: string | null;

  /** Database/driver error message. */
  @Column({ type: "text", name: "error_message", nullable: true })
  errorMessage: string | null;

  /** Server-generated creation timestamp. */
  @Column({ type: "timestamp", name: "created_at", insert: false, update: false })
  createdAt: Date;
}
