-- Migration: create table `subscription_payment_history`

CREATE TABLE IF NOT EXISTS `subscription_payment_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `expense_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_subscription_payment_history_subscription_idx` (`subscription_id`),
  KEY `fk_subscription_payment_history_expense_idx` (`expense_id`),
  CONSTRAINT `fk_subscription_payment_history_expense` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`),
  CONSTRAINT `fk_subscription_payment_history_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscription` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=252 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
