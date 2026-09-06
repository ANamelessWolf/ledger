-- Migration: create table `currency`

CREATE TABLE IF NOT EXISTS `currency` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `symbol` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `conversion` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_currency_UNIQUE` (`id`),
  UNIQUE KEY `name_currency_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
