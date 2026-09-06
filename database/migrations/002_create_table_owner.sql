-- Migration: create table `owner`

CREATE TABLE IF NOT EXISTS `owner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency_id` int NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `username` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `fullname` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_owner_UNIQUE` (`id`),
  UNIQUE KEY `email_owner_UNIQUE` (`email`),
  KEY `fk_owner_currency_idx` (`currency_id`),
  CONSTRAINT `fk_owner_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
