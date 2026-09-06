-- Migration: create table `expense`

CREATE TABLE IF NOT EXISTS `expense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `expense_type_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `description` varchar(120) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `total` double NOT NULL,
  `buy_date` date NOT NULL,
  `sort_id` int DEFAULT '0',
  `currency_factor` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_expense_UNIQUE` (`id`),
  KEY `fk_expense_wallet_idx` (`wallet_id`),
  KEY `fk_expense_expense_type_idx` (`expense_type_id`),
  KEY `fk_expense_vendor_idx` (`vendor_id`),
  CONSTRAINT `fk_expense_expense_type` FOREIGN KEY (`expense_type_id`) REFERENCES `cat_expense_type` (`id`),
  CONSTRAINT `fk_expense_vendor_idx` FOREIGN KEY (`vendor_id`) REFERENCES `cat_vendor` (`id`),
  CONSTRAINT `fk_expense_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2483 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
