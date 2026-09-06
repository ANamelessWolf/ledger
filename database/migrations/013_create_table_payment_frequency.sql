-- Migration: create table `payment_frequency`

CREATE TABLE IF NOT EXISTS `payment_frequency` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `months` int NOT NULL,
  `years` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idFrecuenciaPago_UNIQUE` (`id`),
  UNIQUE KEY `nombre_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
