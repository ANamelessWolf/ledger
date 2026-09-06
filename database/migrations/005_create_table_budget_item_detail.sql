-- Migration: create table `budget_item_detail`

CREATE TABLE IF NOT EXISTS `budget_item_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `budget_id` int NOT NULL,
  `item_type` tinyint NOT NULL,
  `item_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_budget_item_budget_idx_idx` (`budget_id`),
  CONSTRAINT `fk_budget_item_budget_idx` FOREIGN KEY (`budget_id`) REFERENCES `budget` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
