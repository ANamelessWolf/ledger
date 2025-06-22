-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: db_ledger
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `beneficiary`
--

DROP TABLE IF EXISTS `beneficiary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beneficiary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_beneficiary_UNIQUE` (`id`),
  KEY `fk_beneficiary_owner_idx` (`owner_id`),
  CONSTRAINT `fk_beneficiary_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cash`
--

DROP TABLE IF EXISTS `cash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `total` double NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_cash_UNIQUE` (`id`),
  KEY `fk_cash_wallet_idx` (`wallet_id`),
  CONSTRAINT `fk_cash_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cat_expense_type`
--

DROP TABLE IF EXISTS `cat_expense_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_expense_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `icon` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_expense_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cat_financing_type`
--

DROP TABLE IF EXISTS `cat_financing_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_financing_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_financing_type_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cat_payment_type`
--

DROP TABLE IF EXISTS `cat_payment_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_payment_type` (
  `id` int NOT NULL,
  `description` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cat_vendor`
--

DROP TABLE IF EXISTS `cat_vendor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_vendor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_vendor_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cat_wallet_type`
--

DROP TABLE IF EXISTS `cat_wallet_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cat_wallet_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_wallet_type_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `credit`
--

DROP TABLE IF EXISTS `credit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_frequency_id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `total` double NOT NULL,
  `current_payments` int NOT NULL,
  `total_payments` int NOT NULL,
  `last_payment` date NOT NULL,
  `interest_rate` double DEFAULT '0',
  `paid` double NOT NULL DEFAULT '0',
  `pay_rate` double NOT NULL,
  `remaining_payment` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_credit_UNIQUE` (`id`),
  KEY `fk_credit_payment_frequency_idx` (`payment_frequency_id`),
  KEY `fk_credit_wallet_idx` (`wallet_id`),
  CONSTRAINT `fk_credit_payment_frequency` FOREIGN KEY (`payment_frequency_id`) REFERENCES `payment_frequency` (`id`),
  CONSTRAINT `fk_credit_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `credit_card`
--

DROP TABLE IF EXISTS `credit_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entity_id` int NOT NULL,
  `preferred_wallet_id` int NOT NULL,
  `wallet_group_id` int NOT NULL,
  `credit` double NOT NULL,
  `use_credit` double NOT NULL,
  `cut_day` int NOT NULL,
  `days_to_pay` int NOT NULL,
  `expiration` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `card_type` tinyint NOT NULL,
  `ending` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '00000',
  `color` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT 'black',
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_credit_card_UNIQUE` (`id`),
  KEY `fk_credit_card_financing_entity_idx` (`entity_id`),
  KEY `fk_credit_card_wallet_idx` (`preferred_wallet_id`),
  KEY `fk_credit_card_wallet_group_idx` (`wallet_group_id`) USING BTREE,
  CONSTRAINT `fk_credit_card_financing_entity` FOREIGN KEY (`entity_id`) REFERENCES `financing_entity` (`id`),
  CONSTRAINT `fk_credit_card_wallet` FOREIGN KEY (`preferred_wallet_id`) REFERENCES `wallet` (`id`),
  CONSTRAINT `fk_credit_card_wallet_group` FOREIGN KEY (`wallet_group_id`) REFERENCES `wallet_group` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `credit_card_payment`
--

DROP TABLE IF EXISTS `credit_card_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_card_payment` (
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
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `currency`
--

DROP TABLE IF EXISTS `currency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currency` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `symbol` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `conversion` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_currency_UNIQUE` (`id`),
  UNIQUE KEY `name_currency_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `debit_card`
--

DROP TABLE IF EXISTS `debit_card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debit_card` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saving_id` int NOT NULL,
  `cut_day` int NOT NULL,
  `ending` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `expiration` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `card_type` tinyint NOT NULL,
  `color` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_debit_card_UNIQUE` (`id`),
  KEY `fk_debit_card_savings_idx` (`saving_id`),
  CONSTRAINT `fk_debit_card_savings` FOREIGN KEY (`saving_id`) REFERENCES `saving` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `digital_wallet_payment_wallet`
--

DROP TABLE IF EXISTS `digital_wallet_payment_wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `digital_wallet_payment_wallet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `digital_wallet_id` int NOT NULL,
  `payment_wallet_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_digital_payment_wallet_UNIQUE` (`id`),
  KEY `fk_digital_wallet_id_idx` (`digital_wallet_id`),
  KEY `fk_payment_wallet_id_idx` (`payment_wallet_id`),
  CONSTRAINT `fk_digital_wallet_id_idx` FOREIGN KEY (`digital_wallet_id`) REFERENCES `wallet` (`id`),
  CONSTRAINT `fk_payment_wallet_id_idx` FOREIGN KEY (`payment_wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `expense_type_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `description` varchar(120) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `total` double NOT NULL,
  `buy_date` date NOT NULL,
  `sort_id` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_expense_UNIQUE` (`id`),
  KEY `fk_expense_wallet_idx` (`wallet_id`),
  KEY `fk_expense_expense_type_idx` (`expense_type_id`),
  KEY `fk_expense_vendor_idx` (`vendor_id`),
  CONSTRAINT `fk_expense_expense_type` FOREIGN KEY (`expense_type_id`) REFERENCES `cat_expense_type` (`id`),
  CONSTRAINT `fk_expense_vendor_idx` FOREIGN KEY (`vendor_id`) REFERENCES `cat_vendor` (`id`),
  CONSTRAINT `fk_expense_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1178 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `financing_entity`
--

DROP TABLE IF EXISTS `financing_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `financing_entity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `financing_type_id` int NOT NULL,
  `name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_financing_entity_UNIQUE` (`id`),
  UNIQUE KEY `name_financing_entity_UNIQUE` (`name`),
  KEY `fk_financing_entity_financing_type_idx` (`financing_type_id`),
  CONSTRAINT `fk_financing_entity_financing_type` FOREIGN KEY (`financing_type_id`) REFERENCES `cat_financing_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `income`
--

DROP TABLE IF EXISTS `income`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `income` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `deposit_date` date NOT NULL,
  `saving_id` int NOT NULL,
  `total` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `investment`
--

DROP TABLE IF EXISTS `investment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `investment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `currency_id` int NOT NULL,
  `name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `interest_rate` double NOT NULL,
  `description` varchar(400) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci DEFAULT NULL,
  `total` double NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_investment_UNIQUE` (`id`),
  KEY `fk_investment_owner_idx` (`owner_id`),
  KEY `fk_investment_currency_idx` (`currency_id`),
  CONSTRAINT `fk_investment_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_investment_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lend_money`
--

DROP TABLE IF EXISTS `lend_money`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lend_money` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `expense_id` int NOT NULL,
  `beneficiary_id` int NOT NULL,
  `payment_frequency_id` int NOT NULL,
  `total` double NOT NULL,
  `interest_rate` double NOT NULL DEFAULT '0',
  `paid` double NOT NULL DEFAULT '0',
  `last_payment_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_lend_money_UNIQUE` (`id`),
  KEY `fk_lend_money_expense_idx` (`expense_id`),
  KEY `fk_lend_money_owner_idx` (`owner_id`),
  KEY `fk_lend_money_beneficiary_idx` (`beneficiary_id`),
  KEY `fk_lend_money_payment_frequency` (`payment_frequency_id`),
  CONSTRAINT `fk_lend_money_beneficiary` FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiary` (`id`),
  CONSTRAINT `fk_lend_money_expense` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`),
  CONSTRAINT `fk_lend_money_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`),
  CONSTRAINT `fk_lend_money_payment_frequency` FOREIGN KEY (`payment_frequency_id`) REFERENCES `payment_frequency` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_with_no_interest`
--

DROP TABLE IF EXISTS `monthly_with_no_interest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_with_no_interest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `credit_card_id` int NOT NULL,
  `expense_id` int NOT NULL,
  `start_date` date NOT NULL,
  `months` int NOT NULL,
  `paid_months` int NOT NULL DEFAULT '0',
  `archived` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_monthly_no_interest_UNIQUE` (`id`),
  KEY `fk_monthly_no_interest_credit_card` (`credit_card_id`),
  KEY `fk_monthly_no_interest_expense_idx` (`expense_id`),
  CONSTRAINT `fk_monthly_no_interest_credit_card` FOREIGN KEY (`credit_card_id`) REFERENCES `credit_card` (`id`),
  CONSTRAINT `fk_monthly_no_interest_expense` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monthly_with_no_interest_payments`
--

DROP TABLE IF EXISTS `monthly_with_no_interest_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_with_no_interest_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monthly_buy_id` int NOT NULL,
  `expense_id` int NOT NULL,
  `is_paid` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_Monthly_With_No_Interest_Payments_Monthly_With_No_Intere_idx` (`monthly_buy_id`),
  KEY `fk_Monthly_With_No_Interest_Payments_Expense1_idx` (`expense_id`),
  CONSTRAINT `fk_Monthly_With_No_Interest_Payments_Expense1` FOREIGN KEY (`expense_id`) REFERENCES `expense` (`id`),
  CONSTRAINT `fk_Monthly_With_No_Interest_Payments_Monthly_With_No_Interest1` FOREIGN KEY (`monthly_buy_id`) REFERENCES `monthly_with_no_interest` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `owner`
--

DROP TABLE IF EXISTS `owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency_id` int NOT NULL,
  `email` varchar(120) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `username` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `fullname` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_owner_UNIQUE` (`id`),
  UNIQUE KEY `email_owner_UNIQUE` (`email`),
  KEY `fk_owner_currency_idx` (`currency_id`),
  CONSTRAINT `fk_owner_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_frequency`
--

DROP TABLE IF EXISTS `payment_frequency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_frequency` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `months` int NOT NULL,
  `years` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idFrecuenciaPago_UNIQUE` (`id`),
  UNIQUE KEY `nombre_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saving`
--

DROP TABLE IF EXISTS `saving`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saving` (
  `id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `entity_id` int NOT NULL,
  `name` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `interes_rate` double NOT NULL DEFAULT '0',
  `total` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_saving_UNIQUE` (`id`),
  KEY `fk_savings_financing_wallet_idx` (`entity_id`),
  KEY `fk_savings_financing_entity_idx` (`wallet_id`),
  CONSTRAINT `fk_savings_financing_entity` FOREIGN KEY (`entity_id`) REFERENCES `financing_entity` (`id`),
  CONSTRAINT `fk_savings_financing_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `currency_id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `payment_frequency_id` int NOT NULL,
  `name` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  `price` double NOT NULL DEFAULT '0',
  `active` tinyint NOT NULL DEFAULT '1',
  `charge_day` int NOT NULL,
  `last_payment_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_subscription_UNIQUE` (`id`),
  KEY `fk_subscription_currency_idx` (`currency_id`),
  KEY `fk_subscription_wallet_idx` (`wallet_id`),
  KEY `fk_subscription_payment_frequency_idx` (`payment_frequency_id`),
  CONSTRAINT `fk_subscription_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_subscription_payment_frequency` FOREIGN KEY (`payment_frequency_id`) REFERENCES `payment_frequency` (`id`),
  CONSTRAINT `fk_subscription_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_payment_history`
--

DROP TABLE IF EXISTS `subscription_payment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_payment_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `payment_date` date NOT NULL,
  `total` double NOT NULL,
  `exchange_rate` double NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_Subscription_Payment_History_Subscriptions1_idx` (`subscription_id`),
  CONSTRAINT `fk_Subscription_Payment_History_Subscriptions1` FOREIGN KEY (`subscription_id`) REFERENCES `subscription` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `vw_card_list`
--

DROP TABLE IF EXISTS `vw_card_list`;
/*!50001 DROP VIEW IF EXISTS `vw_card_list`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_card_list` AS SELECT 
 1 AS `id`,
 1 AS `entity_id`,
 1 AS `is_credit_card`,
 1 AS `name`,
 1 AS `entity`,
 1 AS `ending`,
 1 AS `active`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_creditcard_payments`
--

DROP TABLE IF EXISTS `vw_creditcard_payments`;
/*!50001 DROP VIEW IF EXISTS `vw_creditcard_payments`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_creditcard_payments` AS SELECT 
 1 AS `id`,
 1 AS `cutDay`,
 1 AS `entity_id`,
 1 AS `name`,
 1 AS `entity`,
 1 AS `ending`,
 1 AS `active`,
 1 AS `payment_date`,
 1 AS `payment`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_expense_daily`
--

DROP TABLE IF EXISTS `vw_expense_daily`;
/*!50001 DROP VIEW IF EXISTS `vw_expense_daily`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_expense_daily` AS SELECT 
 1 AS `total`,
 1 AS `buyDate`,
 1 AS `dayId`,
 1 AS `monthId`,
 1 AS `yearId`,
 1 AS `weekDay`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_monthly_creditcard_installments`
--

DROP TABLE IF EXISTS `vw_monthly_creditcard_installments`;
/*!50001 DROP VIEW IF EXISTS `vw_monthly_creditcard_installments`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_monthly_creditcard_installments` AS SELECT 
 1 AS `creditCardId`,
 1 AS `period`,
 1 AS `name`,
 1 AS `paid`,
 1 AS `balance`,
 1 AS `total`,
 1 AS `color`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_monthly_installment_payments`
--

DROP TABLE IF EXISTS `vw_monthly_installment_payments`;
/*!50001 DROP VIEW IF EXISTS `vw_monthly_installment_payments`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_monthly_installment_payments` AS SELECT 
 1 AS `id`,
 1 AS `paymentId`,
 1 AS `creditCardId`,
 1 AS `wallet`,
 1 AS `expenseBuyId`,
 1 AS `buyTotalValue`,
 1 AS `expenseId`,
 1 AS `expense`,
 1 AS `expenseTypeId`,
 1 AS `expenseType`,
 1 AS `icon`,
 1 AS `vendorId`,
 1 AS `vendor`,
 1 AS `total`,
 1 AS `currencyId`,
 1 AS `currency`,
 1 AS `value`,
 1 AS `buyDate`,
 1 AS `archived`,
 1 AS `isPaid`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_spending_average_credit_card`
--

DROP TABLE IF EXISTS `vw_spending_average_credit_card`;
/*!50001 DROP VIEW IF EXISTS `vw_spending_average_credit_card`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_spending_average_credit_card` AS SELECT 
 1 AS `credit_card_id`,
 1 AS `avg_payment`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_spending_report_credit_card`
--

DROP TABLE IF EXISTS `vw_spending_report_credit_card`;
/*!50001 DROP VIEW IF EXISTS `vw_spending_report_credit_card`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_spending_report_credit_card` AS SELECT 
 1 AS `id`,
 1 AS `entity_id`,
 1 AS `name`,
 1 AS `entity`,
 1 AS `ending`,
 1 AS `active`,
 1 AS `period_cut_date`,
 1 AS `period`,
 1 AS `payment`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_wallet_expense`
--

DROP TABLE IF EXISTS `vw_wallet_expense`;
/*!50001 DROP VIEW IF EXISTS `vw_wallet_expense`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_wallet_expense` AS SELECT 
 1 AS `id`,
 1 AS `walletId`,
 1 AS `parentWalletGroupId`,
 1 AS `walletGroupId`,
 1 AS `wallet`,
 1 AS `expenseTypeId`,
 1 AS `expenseType`,
 1 AS `expenseIcon`,
 1 AS `vendorId`,
 1 AS `vendor`,
 1 AS `description`,
 1 AS `total`,
 1 AS `currency`,
 1 AS `value`,
 1 AS `buyDate`,
 1 AS `sortId`,
 1 AS `isNonIntMonthlyInstallment`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_wallet_list`
--

DROP TABLE IF EXISTS `vw_wallet_list`;
/*!50001 DROP VIEW IF EXISTS `vw_wallet_list`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_wallet_list` AS SELECT 
 1 AS `walletGroupId`,
 1 AS `walletId`,
 1 AS `currencyId`,
 1 AS `wallet`,
 1 AS `currency`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `wallet`
--

DROP TABLE IF EXISTS `wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `wallet_type_id` int NOT NULL,
  `currency_id` int NOT NULL,
  `name` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_wallet_UNIQUE` (`id`),
  KEY `fk_wallet_wallet_type_idx` (`wallet_type_id`),
  KEY `fk_wallet_owner_idx` (`owner_id`),
  KEY `fk_wallet_currency_idx` (`currency_id`),
  CONSTRAINT `fk_wallet_currency` FOREIGN KEY (`currency_id`) REFERENCES `currency` (`id`),
  CONSTRAINT `fk_wallet_owner` FOREIGN KEY (`owner_id`) REFERENCES `owner` (`id`),
  CONSTRAINT `fk_wallet_wallet_type` FOREIGN KEY (`wallet_type_id`) REFERENCES `cat_wallet_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wallet_group`
--

DROP TABLE IF EXISTS `wallet_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_spanish2_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `wallet_member`
--

DROP TABLE IF EXISTS `wallet_member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `wallet_group_id` int NOT NULL,
  `forward_wallet_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_wallet_member_wallet_group_idx` (`wallet_group_id`),
  KEY `fk_wallet_member_wallet` (`wallet_id`),
  CONSTRAINT `fk_wallet_member_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`),
  CONSTRAINT `fk_wallet_member_wallet_group` FOREIGN KEY (`wallet_group_id`) REFERENCES `wallet_group` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish2_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'db_ledger'
--

--
-- Final view structure for view `vw_card_list`
--

/*!50001 DROP VIEW IF EXISTS `vw_card_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_card_list` AS with `vw` as (select `dc`.`id` AS `id`,`fe`.`id` AS `entity_id`,0 AS `is_credit_card`,`w`.`name` AS `name`,`fe`.`name` AS `entity`,`dc`.`ending` AS `ending`,`dc`.`active` AS `active` from (((`debit_card` `dc` left join `saving` `s` on((`dc`.`saving_id` = `s`.`id`))) left join `financing_entity` `fe` on((`fe`.`id` = `s`.`entity_id`))) left join `wallet` `w` on((`w`.`id` = `s`.`wallet_id`))) union select `cc`.`id` AS `id`,`cc`.`entity_id` AS `entity_id`,1 AS `is_credit_card`,`wg`.`name` AS `name`,`fe`.`name` AS `entity`,`cc`.`ending` AS `ending`,`cc`.`active` AS `active` from ((`credit_card` `cc` left join `financing_entity` `fe` on((`fe`.`id` = `cc`.`entity_id`))) left join `wallet_group` `wg` on((`wg`.`id` = `cc`.`wallet_group_id`)))) select `vw`.`id` AS `id`,`vw`.`entity_id` AS `entity_id`,`vw`.`is_credit_card` AS `is_credit_card`,`vw`.`name` AS `name`,`vw`.`entity` AS `entity`,`vw`.`ending` AS `ending`,`vw`.`active` AS `active` from `vw` order by `vw`.`active` desc,`vw`.`entity` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_creditcard_payments`
--

/*!50001 DROP VIEW IF EXISTS `vw_creditcard_payments`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_creditcard_payments` AS select `cc`.`id` AS `id`,`cc`.`cut_day` AS `cutDay`,`cc`.`entity_id` AS `entity_id`,`wg`.`name` AS `name`,`fe`.`name` AS `entity`,`cc`.`ending` AS `ending`,`cc`.`active` AS `active`,`ccp`.`payment_date` AS `payment_date`,`ccp`.`payment_total` AS `payment` from (((`credit_card_payment` `ccp` left join `credit_card` `cc` on((`cc`.`id` = `ccp`.`credit_card_id`))) left join `financing_entity` `fe` on((`fe`.`id` = `cc`.`entity_id`))) left join `wallet_group` `wg` on((`wg`.`id` = `cc`.`wallet_group_id`))) order by `cc`.`id`,`ccp`.`payment_date` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_expense_daily`
--

/*!50001 DROP VIEW IF EXISTS `vw_expense_daily`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_expense_daily` AS with `e_daily` as (select sum((`e`.`total` * `c`.`conversion`)) AS `total`,`e`.`buy_date` AS `buy_date` from (((`expense` `e` left join `wallet` `w` on((`w`.`id` = `e`.`wallet_id`))) left join `currency` `c` on((`c`.`id` = `w`.`currency_id`))) left join `monthly_with_no_interest` `mo` on((`mo`.`expense_id` = `e`.`id`))) where (`mo`.`id` is null) group by `e`.`buy_date` order by `e`.`buy_date`) select `e`.`total` AS `total`,`e`.`buy_date` AS `buyDate`,dayofmonth(`e`.`buy_date`) AS `dayId`,month(`e`.`buy_date`) AS `monthId`,year(`e`.`buy_date`) AS `yearId`,dayofweek(`e`.`buy_date`) AS `weekDay` from `e_daily` `e` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_monthly_creditcard_installments`
--

/*!50001 DROP VIEW IF EXISTS `vw_monthly_creditcard_installments`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_monthly_creditcard_installments` AS with `m` as (select `mwni`.`credit_card_id` AS `credit_card_id`,(case when (`mwnip`.`is_paid` = 1) then `e`.`total` else 0 end) AS `paid`,(case when (`mwnip`.`is_paid` = 0) then `e`.`total` else 0 end) AS `balance`,`e`.`total` AS `total`,cast(concat(year(`e`.`buy_date`),lpad(month(`e`.`buy_date`),2,'0')) as signed) AS `period` from ((`monthly_with_no_interest` `mwni` join `monthly_with_no_interest_payments` `mwnip` on((`mwni`.`id` = `mwnip`.`monthly_buy_id`))) left join `expense` `e` on((`e`.`id` = `mwnip`.`expense_id`)))) select `cc`.`id` AS `creditCardId`,`m`.`period` AS `period`,`wg`.`name` AS `name`,sum(`m`.`paid`) AS `paid`,sum(`m`.`balance`) AS `balance`,sum(`m`.`total`) AS `total`,`cc`.`color` AS `color` from ((`m` left join `credit_card` `cc` on((`cc`.`id` = `m`.`credit_card_id`))) left join `wallet_group` `wg` on((`wg`.`id` = `cc`.`wallet_group_id`))) group by `cc`.`id`,`wg`.`name`,`cc`.`color`,`m`.`period` order by `cc`.`id`,`m`.`period` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_monthly_installment_payments`
--

/*!50001 DROP VIEW IF EXISTS `vw_monthly_installment_payments`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_monthly_installment_payments` AS with `mopay` as (select `moin`.`id` AS `id`,`mopa`.`id` AS `paymentId`,`moin`.`credit_card_id` AS `creditCardId`,`wg`.`name` AS `wallet`,`moin`.`expense_id` AS `expenseBuyId`,(`c`.`conversion` * `b`.`total`) AS `buyTotalValue`,`e`.`id` AS `expenseId`,`e`.`description` AS `expense`,`e`.`expense_type_id` AS `expenseTypeId`,`cet`.`description` AS `expenseType`,`cet`.`icon` AS `icon`,`e`.`vendor_id` AS `vendorId`,`cv`.`description` AS `vendor`,`e`.`total` AS `total`,`c`.`id` AS `currencyId`,`c`.`symbol` AS `currency`,(`c`.`conversion` * `e`.`total`) AS `value`,`e`.`buy_date` AS `buyDate`,`moin`.`archived` AS `archived`,`mopa`.`is_paid` AS `isPaid` from (((((((((`monthly_with_no_interest` `moin` left join `monthly_with_no_interest_payments` `mopa` on((`mopa`.`monthly_buy_id` = `moin`.`id`))) left join `expense` `e` on((`e`.`id` = `mopa`.`expense_id`))) join `credit_card` `cc` on((`cc`.`id` = `moin`.`credit_card_id`))) left join `wallet_group` `wg` on((`wg`.`id` = `cc`.`wallet_group_id`))) left join `cat_expense_type` `cet` on((`cet`.`id` = `e`.`expense_type_id`))) left join `cat_vendor` `cv` on((`cv`.`id` = `e`.`vendor_id`))) left join `wallet` `w` on((`w`.`id` = `e`.`wallet_id`))) left join `currency` `c` on((`c`.`id` = `w`.`currency_id`))) left join `expense` `b` on((`b`.`id` = `moin`.`expense_id`))) where (`mopa`.`id` is not null)) select `mopay`.`id` AS `id`,`mopay`.`paymentId` AS `paymentId`,`mopay`.`creditCardId` AS `creditCardId`,`mopay`.`wallet` AS `wallet`,`mopay`.`expenseBuyId` AS `expenseBuyId`,`mopay`.`buyTotalValue` AS `buyTotalValue`,`mopay`.`expenseId` AS `expenseId`,`mopay`.`expense` AS `expense`,`mopay`.`expenseTypeId` AS `expenseTypeId`,`mopay`.`expenseType` AS `expenseType`,`mopay`.`icon` AS `icon`,`mopay`.`vendorId` AS `vendorId`,`mopay`.`vendor` AS `vendor`,`mopay`.`total` AS `total`,`mopay`.`currencyId` AS `currencyId`,`mopay`.`currency` AS `currency`,`mopay`.`value` AS `value`,`mopay`.`buyDate` AS `buyDate`,`mopay`.`archived` AS `archived`,`mopay`.`isPaid` AS `isPaid` from `mopay` order by `mopay`.`id`,`mopay`.`buyDate` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_spending_average_credit_card`
--

/*!50001 DROP VIEW IF EXISTS `vw_spending_average_credit_card`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_spending_average_credit_card` AS select `ccp`.`credit_card_id` AS `credit_card_id`,round(avg(`ccp`.`payment_total`),2) AS `avg_payment` from (`credit_card_payment` `ccp` join (select `ccp_inner`.`credit_card_id` AS `credit_card_id`,`ccp_inner`.`period_cut_date` AS `period_cut_date` from `credit_card_payment` `ccp_inner` where ((select count(0) from `credit_card_payment` `ccp_sub` where ((`ccp_sub`.`credit_card_id` = `ccp_inner`.`credit_card_id`) and (`ccp_sub`.`period_cut_date` > `ccp_inner`.`period_cut_date`))) < 12)) `last_12` on(((`ccp`.`credit_card_id` = `last_12`.`credit_card_id`) and (`ccp`.`period_cut_date` = `last_12`.`period_cut_date`)))) group by `ccp`.`credit_card_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_spending_report_credit_card`
--

/*!50001 DROP VIEW IF EXISTS `vw_spending_report_credit_card`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_spending_report_credit_card` AS with `cc` as (select `cc`.`id` AS `id`,`cc`.`entity_id` AS `entity_id`,`wg`.`name` AS `name`,`fe`.`name` AS `entity`,`cc`.`ending` AS `ending`,`cc`.`active` AS `active`,`ccp`.`period_cut_date` AS `period_cut_date`,concat(lpad(extract(month from `ccp`.`period_cut_date`),2,'0'),'/',concat(extract(year from `ccp`.`period_cut_date`),'')) AS `period`,`ccp`.`payment_total` AS `payment` from (((`credit_card_payment` `ccp` left join `credit_card` `cc` on((`cc`.`id` = `ccp`.`credit_card_id`))) left join `financing_entity` `fe` on((`fe`.`id` = `cc`.`entity_id`))) left join `wallet_group` `wg` on((`wg`.`id` = `cc`.`wallet_group_id`))) order by `cc`.`id`,`ccp`.`period_cut_date`) select `cc`.`id` AS `id`,`cc`.`entity_id` AS `entity_id`,`cc`.`name` AS `name`,`cc`.`entity` AS `entity`,`cc`.`ending` AS `ending`,`cc`.`active` AS `active`,`cc`.`period_cut_date` AS `period_cut_date`,`cc`.`period` AS `period`,`cc`.`payment` AS `payment` from `cc` order by `cc`.`id`,`cc`.`period_cut_date` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_wallet_expense`
--

/*!50001 DROP VIEW IF EXISTS `vw_wallet_expense`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_wallet_expense` AS with `wallet` as (select `wm2`.`wallet_group_id` AS `parentWalletGroupId`,`wg`.`id` AS `walletGroupId`,`wg`.`name` AS `walletName`,`wm`.`wallet_id` AS `walletId`,`c`.`id` AS `currencyId`,`c`.`symbol` AS `currency`,`c`.`conversion` AS `currencyFactor` from ((((`wallet_group` `wg` join `wallet_member` `wm` on((`wm`.`wallet_group_id` = `wg`.`id`))) left join `wallet_member` `wm2` on((`wm2`.`wallet_id` = `wm`.`forward_wallet_id`))) left join `wallet` `w` on((`wm`.`wallet_id` = `w`.`id`))) left join `currency` `c` on((`c`.`id` = `w`.`currency_id`)))) select `e`.`id` AS `id`,`e`.`wallet_id` AS `walletId`,(case when (`w`.`parentWalletGroupId` is null) then 0 else `w`.`parentWalletGroupId` end) AS `parentWalletGroupId`,(case when (`w`.`parentWalletGroupId` is null) then `w`.`walletGroupId` else `w`.`parentWalletGroupId` end) AS `walletGroupId`,`w`.`walletName` AS `wallet`,`e`.`expense_type_id` AS `expenseTypeId`,`cet`.`description` AS `expenseType`,`cet`.`icon` AS `expenseIcon`,`e`.`vendor_id` AS `vendorId`,`v`.`description` AS `vendor`,`e`.`description` AS `description`,`e`.`total` AS `total`,`w`.`currency` AS `currency`,(`e`.`total` * `w`.`currencyFactor`) AS `value`,`e`.`buy_date` AS `buyDate`,`e`.`sort_id` AS `sortId`,(case when (`mwn`.`id` is null) then 0 else 1 end) AS `isNonIntMonthlyInstallment` from ((((`wallet` `w` join `expense` `e` on((`e`.`wallet_id` = `w`.`walletId`))) left join `cat_expense_type` `cet` on((`e`.`expense_type_id` = `cet`.`id`))) left join `cat_vendor` `v` on((`e`.`vendor_id` = `v`.`id`))) left join `monthly_with_no_interest` `mwn` on((`mwn`.`expense_id` = `e`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_wallet_list`
--

/*!50001 DROP VIEW IF EXISTS `vw_wallet_list`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `vw_wallet_list` AS select `wg`.`id` AS `walletGroupId`,`w`.`id` AS `walletId`,`c`.`id` AS `currencyId`,`wg`.`name` AS `wallet`,`c`.`symbol` AS `currency` from (((`wallet_group` `wg` join `wallet_member` `wm` on((`wm`.`wallet_group_id` = `wg`.`id`))) left join `wallet` `w` on((`w`.`id` = `wm`.`wallet_id`))) left join `currency` `c` on((`c`.`id` = `w`.`currency_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-22 17:14:48
