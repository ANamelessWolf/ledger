-- Migration: create table `monthly_with_no_interest_payments`

CREATE TABLE IF NOT EXISTS `monthly_with_no_interest_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monthly_buy_id` int NOT NULL,
  `expense_id` int NOT NULL,
  `is_paid` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_Monthly_With_No_Interest_Payments_Monthly_With_No_Intere_idx` (`monthly_buy_id`),
  KEY `fk_Monthly_With_No_Interest_Payments_Expense1_idx` (`expense_id`),
  CONSTRAINT `fk_Monthly_With_No_Interest_Payments_Expense1` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`),
  CONSTRAINT `fk_Monthly_With_No_Interest_Payments_Monthly_With_No_Interest1` FOREIGN KEY (`monthly_buy_id`) REFERENCES `monthly_with_no_interest` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=379 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
