-- Migration: create table `wallet`

CREATE TABLE IF NOT EXISTS `wallet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `wallet_type_id` int NOT NULL,
  `currency_id` int NOT NULL,
  `name` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_wallet_UNIQUE` (`id`),
  KEY `fk_wallet_wallet_type_idx` (`wallet_type_id`),
  KEY `fk_wallet_owner_idx` (`owner_id`),
  KEY `fk_wallet_currency_idx` (`currency_id`),
  CONSTRAINT `fk_wallet_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_wallet_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`),
  CONSTRAINT `fk_wallet_wallet_type` FOREIGN KEY (`wallet_type_id`) REFERENCES `cat_wallet_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
