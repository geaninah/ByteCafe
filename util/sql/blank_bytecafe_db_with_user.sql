-- --------------------------------------------------------
-- Host:                         eu-cdbr-azure-west-d.cloudapp.net
-- Server version:               5.5.45-log - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             9.3.0.4984
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping database structure for bytecafedb
CREATE DATABASE IF NOT EXISTS `bytecafedb` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `bytecafedb`;


-- Dumping structure for table bytecafedb.basket_items
CREATE TABLE IF NOT EXISTS `basket_items` (
  `basket_item_user_id` int(10) unsigned NOT NULL,
  `basket_item_product_id` int(10) unsigned NOT NULL,
  `basket_item_cafe_id` int(10) unsigned NOT NULL,
  `basket_item_amount` int(10) unsigned NOT NULL,
  PRIMARY KEY (`basket_item_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.basket_items: ~0 rows (approximately)
/*!40000 ALTER TABLE `basket_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `basket_items` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.cafes
CREATE TABLE IF NOT EXISTS `cafes` (
  `cafe_id` int(11) NOT NULL,
  `cafe_name` varchar(50) NOT NULL,
  `cafe_description` varchar(500) DEFAULT NULL,
  `cafe_map_location` varchar(50) DEFAULT NULL,
  `cafe_address` varchar(200) DEFAULT NULL,
  `cafe_opening_times` varchar(200) DEFAULT NULL,
  `cafe_image_url` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`cafe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.cafes: ~0 rows (approximately)
/*!40000 ALTER TABLE `cafes` DISABLE KEYS */;
/*!40000 ALTER TABLE `cafes` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.cafe_products
CREATE TABLE IF NOT EXISTS `cafe_products` (
  `cafe_product_cafe_id` int(11) NOT NULL,
  `cafe_product_product_id` int(11) NOT NULL,
  `cafe_product_stock` int(11) NOT NULL,
  `cafe_product_purchasable` int(11) NOT NULL,
  PRIMARY KEY (`cafe_product_cafe_id`,`cafe_product_product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.cafe_products: ~0 rows (approximately)
/*!40000 ALTER TABLE `cafe_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `cafe_products` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(50) NOT NULL,
  `category_parent_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.categories: ~0 rows (approximately)
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.nutritional_flags
CREATE TABLE IF NOT EXISTS `nutritional_flags` (
  `nutritional_flag_product_id` int(11) NOT NULL,
  `nutritional_flag_type` varchar(100) NOT NULL,
  `nutritional_flag_value` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.nutritional_flags: ~0 rows (approximately)
/*!40000 ALTER TABLE `nutritional_flags` DISABLE KEYS */;
/*!40000 ALTER TABLE `nutritional_flags` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int(11) NOT NULL,
  `order_cafe_id` int(11) NOT NULL,
  `order_user_id` int(11) NOT NULL,
  `order_date` datetime NOT NULL,
  `order_status` int(11) NOT NULL,
  `order_paypal_transaction` varchar(200) DEFAULT NULL,
  `order_cost` decimal(4,2) NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `order_cafe_id` (`order_cafe_id`),
  KEY `order_user_id` (`order_user_id`),
  KEY `order_date` (`order_date`),
  KEY `order_status` (`order_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.orders: ~0 rows (approximately)
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_item_order_id` int(11) NOT NULL,
  `order_item_product_id` int(11) NOT NULL,
  `order_item_amount` int(11) NOT NULL,
  PRIMARY KEY (`order_item_order_id`,`order_item_product_id`),
  KEY `order_item_order_id` (`order_item_order_id`),
  KEY `order_item_product_id` (`order_item_product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.order_items: ~0 rows (approximately)
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.products
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(50) DEFAULT NULL,
  `product_category_id` int(11) DEFAULT NULL,
  `product_price` decimal(4,2) NOT NULL,
  `product_description` varchar(500) DEFAULT NULL,
  `product_image_url` varchar(200) DEFAULT NULL,
  `product_purchasable` int(11) NOT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.products: ~0 rows (approximately)
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.remember_me_tokens
CREATE TABLE IF NOT EXISTS `remember_me_tokens` (
  `remember_me_token_user_id` int(11) NOT NULL,
  `remember_me_token_selector` varchar(64) NOT NULL,
  `remember_me_token_validator` varchar(64) NOT NULL,
  `remember_me_token_expires` datetime NOT NULL,
  PRIMARY KEY (`remember_me_token_selector`,`remember_me_token_validator`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.remember_me_tokens: ~0 rows (approximately)
/*!40000 ALTER TABLE `remember_me_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `remember_me_tokens` ENABLE KEYS */;


-- Dumping structure for table bytecafedb.users
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) DEFAULT NULL,
  `user_email` varchar(100) NOT NULL,
  `user_password` varchar(60) NOT NULL,
  `user_disabled` int(11) NOT NULL DEFAULT '0',
  `user_permission_store` int(11) NOT NULL DEFAULT '1',
  `user_permission_pos` int(11) NOT NULL DEFAULT '0',
  `user_permission_stock` int(11) NOT NULL DEFAULT '0',
  `user_permission_admin` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

/* PLEAASE OH PLEASE DONT LET THIS GET INTO PRODUCTION */
/* TODO */


-- Dumping data for table bytecafedb.users: ~1 rows (approximately)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`user_id`, `user_name`, `user_email`, `user_password`, `user_disabled`, `user_permission_store`, `user_permission_pos`, `user_permission_stock`, `user_permission_admin`) VALUES
	(1, NULL, 'joe@joe.com', '$2a$10$ZrAlyogPiTWjQlNYv0UCFO7mE6QUUJfeiiqhZVnSzk735k8BS.aU6', 0, 1, 1, 1, 1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
