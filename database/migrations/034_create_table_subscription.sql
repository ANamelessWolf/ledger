-- Migration: create table `subscription`

CREATE TABLE IF NOT EXISTS `subscription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency_id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `payment_frequency_id` int NOT NULL,
  `name` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `price` double NOT NULL DEFAULT '0',
  `active` tinyint NOT NULL DEFAULT '1',
  `charge_day` int NOT NULL,
  `last_payment_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_subscription_UNIQUE` (`id`),
  KEY `fk_subscription_currency_idx` (`currency_id`),
  KEY `fk_subscription_wallet_idx` (`wallet_id`),
  KEY `fk_subscription_payment_frequency_idx` (`payment_frequency_id`),
  CONSTRAINT `fk_subscription_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_subscription_payment_frequency` FOREIGN KEY (`payment_frequency_id`) REFERENCES `payment_frequency` (`id`),
  CONSTRAINT `fk_subscription_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
