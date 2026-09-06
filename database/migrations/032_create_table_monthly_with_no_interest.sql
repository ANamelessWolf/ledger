-- Migration: create table `monthly_with_no_interest`

CREATE TABLE IF NOT EXISTS `monthly_with_no_interest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `credit_card_id` int NOT NULL,
  `expense_id` int NOT NULL,
  `start_date` date NOT NULL,
  `months` int NOT NULL,
  `paid_months` int NOT NULL DEFAULT '0',
  `archived` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_monthly_no_interest_UNIQUE` (`id`),
  KEY `fk_monthly_no_interest_credit_card` (`credit_card_id`),
  KEY `fk_monthly_no_interest_expense_idx` (`expense_id`),
  CONSTRAINT `fk_monthly_no_interest_credit_card` FOREIGN KEY (`credit_card_id`) REFERENCES `credit_card` (`id`),
  CONSTRAINT `fk_monthly_no_interest_expense` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
