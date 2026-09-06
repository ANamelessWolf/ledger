-- Migration: create table `credit_card_payment`

CREATE TABLE IF NOT EXISTS `credit_card_payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `credit_card_id` int NOT NULL,
  `payment_total` double NOT NULL,
  `payment_date` date NOT NULL,
  `period_cut_date` date NOT NULL,
  `period_due_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_credit_card_payment_idx` (`credit_card_id`),
  CONSTRAINT `fk_credit_card_payment` FOREIGN KEY (`credit_card_id`) REFERENCES `credit_card` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=218 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
