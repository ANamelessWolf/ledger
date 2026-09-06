-- Migration: create table `financing_section`

CREATE TABLE IF NOT EXISTS `financing_section` (
  `id` int NOT NULL AUTO_INCREMENT,
  `financing_account_id` int NOT NULL,
  `currency_id` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `balance` double NOT NULL DEFAULT '0',
  `is_investment` tinyint NOT NULL DEFAULT '0',
  `is_locked` tinyint NOT NULL DEFAULT '0',
  `is_available` tinyint NOT NULL DEFAULT '1',
  `investment_rate` double DEFAULT NULL,
  `investment_start_date` date DEFAULT NULL,
  `investment_end_date` date DEFAULT NULL,
  `display_currency_id` int DEFAULT NULL,
  `is_complete` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_financing_section_account_idx` (`financing_account_id`),
  KEY `fk_financing_account_currency_idx` (`currency_id`),
  KEY `fk_financing_section_display_currency_idx` (`display_currency_id`),
  CONSTRAINT `fk_financing_account_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_financing_section_account` FOREIGN KEY (`financing_account_id`) REFERENCES `financing_account` (`id`),
  CONSTRAINT `fk_financing_section_display_currency` FOREIGN KEY (`display_currency_id`) REFERENCES `currency` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
