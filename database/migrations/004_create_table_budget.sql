-- Migration: create table `budget`

CREATE TABLE IF NOT EXISTS `budget` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL DEFAULT '1',
  `currency_id` int NOT NULL,
  `description` varchar(300) DEFAULT NULL,
  `icon` varchar(30) DEFAULT NULL,
  `total` double DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `annual_budget` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_budget_owner_idx_idx` (`owner_id`),
  KEY `fk_budget_currency_idx_idx` (`currency_id`),
  CONSTRAINT `fk_budget_currency_idx` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_budget_owner_idx` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
