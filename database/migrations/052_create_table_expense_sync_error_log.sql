-- Migration: create table `expense_sync_error_log`
--
-- Server-side diagnostics for the mobile batch-sync endpoint. When a batch
-- fails, the expense inserts are rolled back and one row per request item is
-- written here in an independent transaction, so the log survives the
-- rollback. Not exposed to the mobile app.

CREATE TABLE IF NOT EXISTS `expense_sync_error_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sync_key` varchar(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `request_body` json NOT NULL,
  `error_code` varchar(64) DEFAULT NULL,
  `error_message` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expense_sync_error_log_sync_key` (`sync_key`),
  KEY `idx_expense_sync_error_log_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
