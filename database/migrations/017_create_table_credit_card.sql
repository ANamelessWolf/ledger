-- Migration: create table `credit_card`

CREATE TABLE IF NOT EXISTS `credit_card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_id` int NOT NULL,
  `preferred_wallet_id` int NOT NULL,
  `wallet_group_id` int NOT NULL,
  `credit` double NOT NULL,
  `use_credit` double NOT NULL,
  `cut_day` int NOT NULL,
  `days_to_pay` int NOT NULL,
  `expiration` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `card_type` tinyint NOT NULL,
  `ending` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '00000',
  `color` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'black',
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_credit_card_UNIQUE` (`id`),
  KEY `fk_credit_card_financing_entity_idx` (`entity_id`),
  KEY `fk_credit_card_wallet_idx` (`preferred_wallet_id`),
  KEY `fk_credit_card_wallet_group_idx` (`wallet_group_id`) USING BTREE,
  CONSTRAINT `fk_credit_card_financing_entity` FOREIGN KEY (`entity_id`) REFERENCES `financing_entity` (`id`),
  CONSTRAINT `fk_credit_card_wallet` FOREIGN KEY (`preferred_wallet_id`) REFERENCES `wallet` (`id`),
  CONSTRAINT `fk_credit_card_wallet_group` FOREIGN KEY (`wallet_group_id`) REFERENCES `wallet_group` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
