-- Migration: create table `investment_earnings`

CREATE TABLE IF NOT EXISTS `investment_earnings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `financing_account_id` int NOT NULL,
  `financing_section_id` int NOT NULL,
  `total` double NOT NULL,
  `investment_end_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_investment_earnings_UNIQUE` (`id`),
  KEY `fk_ie_account_idx` (`financing_account_id`),
  KEY `fk_ie_section_idx` (`financing_section_id`),
  CONSTRAINT `fk_ie_account` FOREIGN KEY (`financing_account_id`) REFERENCES `financing_account` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ie_section` FOREIGN KEY (`financing_section_id`) REFERENCES `financing_section` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
