-- Migration: create table `expense_group_detail`

CREATE TABLE IF NOT EXISTS `expense_group_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `expense_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_expense_group_detail_UNIQUE` (`id`),
  UNIQUE KEY `uq_group_expense` (`group_id`,`expense_id`),
  KEY `fk_egd_group_idx` (`group_id`),
  KEY `fk_egd_expense_idx` (`expense_id`),
  CONSTRAINT `fk_egd_expense` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_egd_group` FOREIGN KEY (`group_id`) REFERENCES `expense_group` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
