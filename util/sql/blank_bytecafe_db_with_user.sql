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
  PRIMARY KEY (`basket_item_user_id`,`basket_item_product_id`,`basket_item_cafe_id`),
  KEY `basket_item_user_id` (`basket_item_user_id`)
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
  `cafe_avaliable` int(11) NOT NULL,
  PRIMARY KEY (`cafe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.cafes: ~27 rows (approximately)
/*!40000 ALTER TABLE `cafes` DISABLE KEYS */;
INSERT INTO `cafes` (`cafe_id`, `cafe_name`, `cafe_description`, `cafe_map_location`, `cafe_address`, `cafe_opening_times`, `cafe_image_url`, `cafe_avaliable`) VALUES
	(1, 'Browsers', 'Great Fairtrade coffee, sandwiches, soups and snacks', NULL, 'Sackville Street', 'Mon-Fri 08:30 - 15:30', NULL, 0),
	(2, 'Café North', 'Sandwiches, soups and snacks, speciality tea, Coffee ', NULL, 'Barnes Wallis Hub', 'Mon-Fri 09:00 - 18:00', NULL, 0),
	(3, 'The MeSS', 'Hot and cold drinks, sandwiches, jacket potatoes and snacks', NULL, 'Maths and Social Science Tower', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(4, 'Senior Common Room & Mumford Restaurant', 'The Mumford features freshly cooked hot lunches with carvery option great for meetings and entertaining', NULL, 'Manchester Meeting Place', 'Mon-Fri 11:45 - 14:00', NULL, 0),
	(5, 'Enigma', 'Three freshly cooked hot dishes daily plus salad bar and cooked breakfasts', NULL, 'Renold', 'Mon-Fri 08:00 - 16:00', NULL, 0),
	(6, 'Café de Paris', 'Coffee, soup and snacks', NULL, 'Praiser', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(7, 'Starbucks', 'Our very own Starbucks', NULL, 'Sackville Street', ' Mon-Sat 07:30 - 19:00', NULL, 0),
	(8, 'GB Café', 'Coffee, jackets, sandwiches and snacks', NULL, 'George Begg ', 'Mon-Fri 09:00 - 16:00', NULL, 0),
	(9, 'Café Interface', 'Coffee, hot dish of the day and deli bar', NULL, 'John Garside', 'Mon-Fri 08:30 - 15:30', NULL, 0),
	(10, 'Pi in the Sky', 'Coffee, soup, snacks and freshly made hot sandwiches', NULL, 'Alan Turing', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(11, 'Error Bar', 'Coffee, jackets, Panini\'s, toasties and snacks', NULL, 'Schuster', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(12, 'Greenhouse', 'Great freshly cooked vegetarian food', NULL, 'George Kenyon', ' Mon-Fri 07:30 to 16:00', NULL, 0),
	(13, 'Café 204', 'Great coffee, jackets, soups and snacks with large outdoor seating area to enjoy the Manchester sunshine!', NULL, 'Chemistry', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(14, 'Food for Thought', 'Coffee, jackets, soup and snacks', NULL, 'Zochonis', 'Mon-Fri 08:30 - 16:00', NULL, 0),
	(15, 'Vasaio', 'Fresh pasta, pizza, hot sandwiches and hot salads cooked to order', NULL, 'Simon Building', ' Mon-Fri 07:45 - 16:00', NULL, 0),
	(16, 'Atrium Café', 'Coffee, Sandwiches, Soups, Jackets and snacks with comfy seating and internet access', NULL, 'Jean McFarlane Building', 'Mon-Fri 09:00 - 15:00', NULL, 0),
	(17, 'Eats Restaurant & Giftshop', 'Eats is our biggest restaurant featuring four great freshly cooked food concepts including Fish and Chips, Burgers, International, Daily Specials and a salad bar.', NULL, 'University Place', 'EATS - Mon-Fri 08:00 - 15:00 (serves food until 2:30)', NULL, 0),
	(18, 'Byte Café', 'Coffee and snacks', NULL, 'Kilburn', 'Mon-Fri 09:00 - 15:00', NULL, 0),
	(19, 'Arthur\'s Brew', 'Coffee, soup and snacks', NULL, 'Arthur Lewis', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(20, 'Kaffe K', 'Artisan coffee at its best in a relaxing environment', NULL, 'Humanities Bridgeford St.', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(21, 'Café Arts', 'Coffee, sandwiches, soup and snacks', NULL, 'Martin Harris Centre', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(22, 'Café at The Learning Commons', 'Hot and cold drinks, freshly made sandwiches, soup, cakes, breakfast and other hot items throughout the day', NULL, 'Alan Gilbert Learning Commons', 'Mon-Fri 09:00 - 20:00, Sat - Sun 10:00 - 16:00', NULL, 0),
	(23, 'Café at the Library Lounge', 'Coffee, cold drinks, sandwiches and snacks', NULL, 'Main Library', 'Mon-Fri 09:00 - 19:30, Sat 10:00 - 16:00, Sun 12:30 - 16:30', NULL, 0),
	(24, 'Lime Café', 'Located on lower ground floor next to computer cluster serving delicious hot or cold food', NULL, 'Samuel Alexander Building', 'Mon - Fri 09:00 - 15:30', NULL, 0),
	(25, 'Coopers', 'Coffee, sandwiches and snacks', NULL, 'Mansfield Cooper Building', 'Mon - Fri 09:30 - 15:30', NULL, 0),
	(26, 'Café Devas', 'Coffee, soup and snacks', NULL, 'Ellen Wilkinson Building', 'Mon-Fri 09:00 - 15:30', NULL, 0),
	(27, 'Chromo-Zone', 'Hot and cold food featuring a locally sourced salad bar"', NULL, 'Stopford Building', 'Mon-Fri 08:00 - 16:00', NULL, 0);
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
  `order_item_cafe_id` int(11) NOT NULL,
  `order_item_amount` int(11) NOT NULL,
  PRIMARY KEY (`order_item_order_id`,`order_item_product_id`,`order_item_cafe_id`),
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

-- Dumping data for table bytecafedb.remember_me_tokens: ~2 rows (approximately)
/*!40000 ALTER TABLE `remember_me_tokens` DISABLE KEYS */;
INSERT INTO `remember_me_tokens` (`remember_me_token_user_id`, `remember_me_token_selector`, `remember_me_token_validator`, `remember_me_token_expires`) VALUES
	(1, 'Tky4/l9Y+BXBD/RDxv7Iqm3/FOSYm4EkOce7IlMW6QLIgW18A2V4TWzT9ble28Pv', 'nsWshPgHSBxpoaZdXgh7Jga5Xse4ScUXtJD7gL00QOJW1JZIXxZ+B4XhP93zwWlP', '2016-04-14 16:57:26'),
	(1, 'TT2aV4QEiqfc0ZRgQvA3hILD2WlE8T8ACN1k7p4WHX2JM6ANifWiQcpqeuaDPW87', 'ssEjQPgAUICzzeNwfhlZXcmrNTu49SkcGJuGS0vNvy1Vpuu2D1JLHlLrbauRKqxu', '2016-04-14 05:40:36');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- Dumping data for table bytecafedb.users: ~1 rows (approximately)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`user_id`, `user_name`, `user_email`, `user_password`, `user_disabled`, `user_permission_store`, `user_permission_pos`, `user_permission_stock`, `user_permission_admin`) VALUES
	(1, NULL, 'joe@joe.com', '$2a$10$ZrAlyogPiTWjQlNYv0UCFO7mE6QUUJfeiiqhZVnSzk735k8BS.aU6', 0, 1, 0, 0, 0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
