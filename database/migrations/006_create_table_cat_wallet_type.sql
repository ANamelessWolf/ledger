-- Migration: create table `cat_wallet_type`

CREATE TABLE IF NOT EXISTS `cat_wallet_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_wallet_type_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
