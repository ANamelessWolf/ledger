-- Migration: create table `lend_money`

CREATE TABLE IF NOT EXISTS `lend_money` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `expense_id` int NOT NULL,
  `beneficiary_id` int NOT NULL,
  `payment_frequency_id` int NOT NULL,
  `total` double NOT NULL,
  `interest_rate` double NOT NULL DEFAULT '0',
  `paid` double NOT NULL DEFAULT '0',
  `last_payment_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_lend_money_UNIQUE` (`id`),
  KEY `fk_lend_money_expense_idx` (`expense_id`),
  KEY `fk_lend_money_owner_idx` (`owner_id`),
  KEY `fk_lend_money_beneficiary_idx` (`beneficiary_id`),
  KEY `fk_lend_money_payment_frequency` (`payment_frequency_id`),
  CONSTRAINT `fk_lend_money_beneficiary` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiary` (`id`),
  CONSTRAINT `fk_lend_money_expense` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`),
  CONSTRAINT `fk_lend_money_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`),
  CONSTRAINT `fk_lend_money_payment_frequency` FOREIGN KEY (`payment_frequency_id`) REFERENCES `payment_frequency` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
