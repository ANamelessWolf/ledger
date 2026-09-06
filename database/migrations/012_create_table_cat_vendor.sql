-- Migration: create table `cat_vendor`

CREATE TABLE IF NOT EXISTS `cat_vendor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_vendor_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
