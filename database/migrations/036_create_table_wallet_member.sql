-- Migration: create table `wallet_member`

CREATE TABLE IF NOT EXISTS `wallet_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `wallet_group_id` int NOT NULL,
  `forward_wallet_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_wallet_member_wallet_group_idx` (`wallet_group_id`),
  KEY `fk_wallet_member_wallet` (`wallet_id`),
  CONSTRAINT `fk_wallet_member_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`),
  CONSTRAINT `fk_wallet_member_wallet_group` FOREIGN KEY (`wallet_group_id`) REFERENCES `wallet_group` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
