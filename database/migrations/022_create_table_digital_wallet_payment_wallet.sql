-- Migration: create table `digital_wallet_payment_wallet`

CREATE TABLE IF NOT EXISTS `digital_wallet_payment_wallet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `digital_wallet_id` int NOT NULL,
  `payment_wallet_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_digital_payment_wallet_UNIQUE` (`id`),
  KEY `fk_digital_wallet_id_idx` (`digital_wallet_id`),
  KEY `fk_payment_wallet_id_idx` (`payment_wallet_id`),
  CONSTRAINT `fk_digital_wallet_id_idx` FOREIGN KEY (`digital_wallet_id`) REFERENCES `wallet` (`id`),
  CONSTRAINT `fk_payment_wallet_id_idx` FOREIGN KEY (`payment_wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
