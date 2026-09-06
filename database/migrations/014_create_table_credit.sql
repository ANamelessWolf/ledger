-- Migration: create table `credit`

CREATE TABLE IF NOT EXISTS `credit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_frequency_id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `total` double NOT NULL,
  `current_payments` int NOT NULL,
  `total_payments` int NOT NULL,
  `last_payment` date NOT NULL,
  `interest_rate` double DEFAULT '0',
  `paid` double NOT NULL DEFAULT '0',
  `pay_rate` double NOT NULL,
  `remaining_payment` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_credit_UNIQUE` (`id`),
  KEY `fk_credit_payment_frequency_idx` (`payment_frequency_id`),
  KEY `fk_credit_wallet_idx` (`wallet_id`),
  CONSTRAINT `fk_credit_payment_frequency` FOREIGN KEY (`payment_frequency_id`) REFERENCES `payment_frequency` (`id`),
  CONSTRAINT `fk_credit_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
