-- Migration: create table `cat_financing_type`

CREATE TABLE IF NOT EXISTS `cat_financing_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_financing_type_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
