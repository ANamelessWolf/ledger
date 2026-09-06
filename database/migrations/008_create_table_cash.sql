-- Migration: create table `cash`

CREATE TABLE IF NOT EXISTS `cash` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `total` double NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_cash_UNIQUE` (`id`),
  KEY `fk_cash_wallet_idx` (`wallet_id`),
  CONSTRAINT `fk_cash_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
