-- Migration: create table `beneficiary`

CREATE TABLE IF NOT EXISTS `beneficiary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_beneficiary_UNIQUE` (`id`),
  KEY `fk_beneficiary_owner_idx` (`owner_id`),
  CONSTRAINT `fk_beneficiary_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
