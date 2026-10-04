-- Migration: create table `expense_sync_key`
--
-- Idempotency keys for the mobile batch-sync endpoint (POST /expenses/sync).
-- Every expense created from the mobile app carries a stable client-generated
-- `sync_key`. The primary key guarantees that the same key can only ever be
-- associated with one expense, so a retried upload returns the existing
-- expense id instead of inserting a duplicate.
--
-- ON DELETE CASCADE keeps the existing web `DELETE /expenses/:id` behavior
-- working for expenses that were created from the mobile app.

CREATE TABLE IF NOT EXISTS `expense_sync_key` (
  `sync_key` varchar(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expense_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sync_key`),
  UNIQUE KEY `uq_expense_sync_key_expense` (`expense_id`),
  CONSTRAINT `fk_expense_sync_key_expense` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
