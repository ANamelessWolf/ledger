-- Migration: create table `saving`

CREATE TABLE IF NOT EXISTS `saving` (
  `id` int NOT NULL AUTO_INCREMENT,
  `preferred_wallet_id` int NOT NULL,
  `wallet_group_id` int DEFAULT NULL,
  `entity_id` int NOT NULL,
  `financing_account_id` int NOT NULL,
  `currency_id` int NOT NULL,
  `balance` double DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_saving_UNIQUE` (`id`),
  KEY `fk_savings_financing_wallet_idx` (`entity_id`),
  KEY `fk_savings_financing_entity_idx` (`preferred_wallet_id`),
  KEY `fk_financing_account_savings_idx` (`financing_account_id`),
  KEY `fk_saving_currency_idx` (`currency_id`),
  KEY `fk_saving_wallet_group_idx` (`wallet_group_id`),
  CONSTRAINT `fk_financing_account_savings` FOREIGN KEY (`financing_account_id`) REFERENCES `financing_account` (`id`),
  CONSTRAINT `fk_saving_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_saving_wallet_group` FOREIGN KEY (`wallet_group_id`) REFERENCES `wallet_group` (`id`),
  CONSTRAINT `fk_savings_financing_entity` FOREIGN KEY (`entity_id`) REFERENCES `financing_entity` (`id`),
  CONSTRAINT `fk_savings_financing_wallet` FOREIGN KEY (`preferred_wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
