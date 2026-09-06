-- Migration: create table `investments`

CREATE TABLE IF NOT EXISTS `investments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency_id` int NOT NULL,
  `financing_account_id` int NOT NULL,
  `balance` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_currency_investment_idx` (`currency_id`),
  KEY `fk_financing_account_investment_idx` (`financing_account_id`),
  CONSTRAINT `fk_currency_investment` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_financing_account_investment` FOREIGN KEY (`financing_account_id`) REFERENCES `financing_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
