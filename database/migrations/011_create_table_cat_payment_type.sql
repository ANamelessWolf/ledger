-- Migration: create table `cat_payment_type`

CREATE TABLE IF NOT EXISTS `cat_payment_type` (
  `id` int NOT NULL,
  `description` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
