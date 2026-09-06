-- Migration: create table `financing_entity`

CREATE TABLE IF NOT EXISTS `financing_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `financing_type_id` int NOT NULL,
  `name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_financing_entity_UNIQUE` (`id`),
  UNIQUE KEY `name_financing_entity_UNIQUE` (`name`),
  KEY `fk_financing_entity_financing_type_idx` (`financing_type_id`),
  CONSTRAINT `fk_financing_entity_financing_type` FOREIGN KEY (`financing_type_id`) REFERENCES `cat_financing_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
