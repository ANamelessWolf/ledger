-- Migration: create table `debit_card`

CREATE TABLE IF NOT EXISTS `debit_card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saving_id` int NOT NULL,
  `cut_day` int NOT NULL,
  `ending` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `expiration` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `card_type` tinyint NOT NULL,
  `color` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_debit_card_UNIQUE` (`id`),
  KEY `fk_debit_card_savings_idx` (`saving_id`),
  CONSTRAINT `fk_debit_card_savings` FOREIGN KEY (`saving_id`) REFERENCES `saving` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
