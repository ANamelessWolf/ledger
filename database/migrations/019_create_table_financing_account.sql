-- Migration: create table `financing_account`

CREATE TABLE IF NOT EXISTS `financing_account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `financing_type_id` int DEFAULT NULL,
  `name` varchar(45) NOT NULL,
  `description` varchar(250) DEFAULT 'Cuenta financiera',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `financing_account_type_id_idx` (`financing_type_id`),
  CONSTRAINT `financing_account_type_id` FOREIGN KEY (`financing_type_id`) REFERENCES `cat_financing_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
