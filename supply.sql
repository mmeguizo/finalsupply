/*
 Navicat Premium Data Transfer

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : supply

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 06/01/2026 11:02:11
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for department
-- ----------------------------
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_2`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_3`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_4`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_5`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_6`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_7`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_8`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_9`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_10`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_11`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_12`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_13`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_14`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_15`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_16`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_17`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_18`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_19`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_20`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_21`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_22`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_23`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_24`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_25`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_26`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_27`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_28`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_29`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_30`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_31`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_32`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_33`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_34`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_35`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_36`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_37`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_38`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_39`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_40`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_41`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_42`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_43`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_44`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_45`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_46`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_47`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_48`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_49`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_50`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_51`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_52`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_53`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_54`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_55`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_56`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_57`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_58`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_59`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_60`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_61`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of department
-- ----------------------------
INSERT INTO `department` VALUES (1, 'MIS', 'MIS department under ICT ni sir russel', 1, '2025-07-07 05:25:22', '2025-07-07 05:25:36');
INSERT INTO `department` VALUES (2, 'tester', 'tester', 0, '2025-07-07 05:25:43', '2025-07-07 05:25:46');
INSERT INTO `department` VALUES (3, 'IT Officer', 'IT Officer under ICT', 1, '2025-07-07 05:40:38', '2025-07-07 05:40:38');
INSERT INTO `department` VALUES (4, 'Supply', 'Supply office', 1, '2025-08-05 03:14:43', '2025-08-05 03:14:43');

-- ----------------------------
-- Table structure for inspection_acceptance_report
-- ----------------------------
DROP TABLE IF EXISTS `inspection_acceptance_report`;
CREATE TABLE `inspection_acceptance_report`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `iar_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `purchase_order_id` int NOT NULL,
  `item_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `quantity` int NULL DEFAULT NULL,
  `unit_cost` decimal(10, 2) NULL DEFAULT NULL,
  `amount` decimal(10, 2) NULL DEFAULT NULL,
  `actual_quantity_received` int NOT NULL DEFAULT 0,
  `category` enum('property acknowledgement reciept','inventory custodian slip','requisition issue slip') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'requisition issue slip',
  `tag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'none',
  `is_deleted` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `purchase_order_item_id` int NOT NULL,
  `ics_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ris_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `par_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `updated_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `inventory_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `iar_status` enum('partial','complete','none') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'none',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `purchase_order_id`(`purchase_order_id` ASC) USING BTREE,
  INDEX `purchase_order_item_id`(`purchase_order_item_id` ASC) USING BTREE,
  CONSTRAINT `inspection_acceptance_report_ibfk_289` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inspection_acceptance_report_ibfk_290` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 362 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_acceptance_report
-- ----------------------------
INSERT INTO `inspection_acceptance_report` VALUES (360, '120925-001-B', 123, '', 'tester', 'tester', 2, 10.00, 20.00, 2, 'property acknowledgement reciept', '', 0, '2025-12-09 02:19:41', '2025-12-09 02:19:41', 262, NULL, NULL, '25-001B', 'Mark Oliver ', 'Mark Oliver ', '213', 'none');
INSERT INTO `inspection_acceptance_report` VALUES (361, '120925-001-B', 123, '', 'tester', 'tester', 10, 10.00, 100.00, 8, 'property acknowledgement reciept', '', 0, '2025-12-09 02:19:57', '2025-12-09 02:19:57', 263, NULL, NULL, '25-001B', 'Mark Oliver ', 'Mark Oliver ', '213', 'none');

-- ----------------------------
-- Table structure for purchase_order_items
-- ----------------------------
DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE `purchase_order_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_order_id` int NOT NULL,
  `item_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `general_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `specification` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `unit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `quantity` int NULL DEFAULT NULL,
  `unit_cost` decimal(10, 2) NULL DEFAULT NULL,
  `amount` decimal(10, 2) NULL DEFAULT NULL,
  `actual_quantity_received` int NOT NULL DEFAULT 0,
  `category` enum('property acknowledgement reciept','inventory custodian slip','requisition issue slip') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'requisition issue slip',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_deleted` tinyint(1) NULL DEFAULT 0,
  `tag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'none',
  `iar_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `inventory_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'none',
  `item_group_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Stable grouping key for logical item across updates/receipts',
  `is_receipt_line` tinyint(1) NULL DEFAULT 0 COMMENT 'Optional marker for cloned receipt-only lines',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `purchase_order_id`(`purchase_order_id` ASC) USING BTREE,
  CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 264 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_order_items
-- ----------------------------
INSERT INTO `purchase_order_items` VALUES (262, 123, '', 'tester', 'tester', 'tester', 'tester', 10, 10.00, 100.00, 2, 'property acknowledgement reciept', '2025-12-09 02:19:21', '2025-12-09 02:19:41', 0, '', NULL, '213', 'mu60va0roo', 0);
INSERT INTO `purchase_order_items` VALUES (263, 123, '', 'tester', 'test', 'tester', 'tester', 10, 10.00, 100.00, 8, 'property acknowledgement reciept', '2025-12-09 02:19:57', '2025-12-09 02:19:57', 0, '', NULL, '213', 'mu60va0roo', 1);

-- ----------------------------
-- Table structure for purchase_order_items_history
-- ----------------------------
DROP TABLE IF EXISTS `purchase_order_items_history`;
CREATE TABLE `purchase_order_items_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchase_order_item_id` int NOT NULL,
  `previous_quantity` int NOT NULL,
  `new_quantity` int NOT NULL,
  `previous_actual_quantity_received` int NOT NULL,
  `new_actual_quantity_received` int NOT NULL,
  `previous_amount` decimal(10, 2) NOT NULL,
  `new_amount` decimal(10, 2) NOT NULL,
  `change_type` enum('quantity_update','received_update','amount_update','marking_complete','item_creation','po_completed','item_details_update') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `change_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `purchase_order_id` int NULL DEFAULT NULL,
  `item_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `iar_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `par_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `ris_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `ics_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_purchase_order_item_id`(`purchase_order_item_id` ASC) USING BTREE,
  CONSTRAINT `purchase_order_items_history_ibfk_1` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 406 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_order_items_history
-- ----------------------------
INSERT INTO `purchase_order_items_history` VALUES (403, 262, 10, 10, 0, 2, 100.00, 100.00, 'received_update', 'Mark Oliver ', 'Received qty + details update', '2025-12-09 02:19:41', '2025-12-09 02:19:41', 123, '', 'tester', '120925-001-B', '25-001B', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (404, 263, 0, 10, 0, 8, 0.00, 100.00, 'item_creation', 'Mark Oliver ', 'New line item created from source item 262 with itemGroupId mu60va0roo', '2025-12-09 02:19:57', '2025-12-09 02:19:57', 123, '', 'tester', '120925-001-B', '25-001B', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (405, 262, 10, 10, 2, 2, 100.00, 100.00, 'po_completed', 'Mark Oliver ', 'Purchase Order Marked Complete', '2025-12-09 02:30:37', '2025-12-09 02:30:37', NULL, '', NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for purchase_orders
-- ----------------------------
DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE `purchase_orders`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `po_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `mode_of_procurement` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `place_of_delivery` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `date_of_delivery` date NOT NULL,
  `date_of_payment` date NOT NULL,
  `date_of_conformity` date NULL DEFAULT NULL,
  `delivery_terms` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `payment_terms` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `amount` decimal(10, 2) NOT NULL,
  `status` enum('partial','closed','cancel','completed','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending',
  `is_deleted` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `supplier` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `invoice` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `telephone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `completed_status_date` date NULL DEFAULT NULL,
  `campus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Campus name: Talisay | Alijis | Binalbagan | Fortune Town',
  `fundsource` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `income` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Income source or code',
  `mds` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'MDS reference',
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Additional PO details',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 124 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_orders
-- ----------------------------
INSERT INTO `purchase_orders` VALUES (123, '0607-234-25-C', 'direct contracting', 'MIS-DPO', '2025-12-09', '2025-12-09', '2025-12-09', '', 'not more than 30 days', 100.00, 'completed', 0, '2025-12-09 02:19:21', '2025-12-09 02:30:37', 'JT & SONS TRADING CORP', 'talisay city, Negros Occidental, 6115, PH', NULL, '', NULL, '2025-12-09', 'Binalbagan', 'flood control', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_deleted` tinyint(1) NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_2`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_3`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_4`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_5`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_6`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_7`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_8`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_9`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_10`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_11`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_12`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_13`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_14`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_15`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_16`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_17`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_18`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_19`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_20`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_21`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_22`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_23`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_24`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_25`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_26`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_27`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_28`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_29`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_30`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_31`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_32`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_33`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_34`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_35`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_36`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_37`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_38`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_39`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_40`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_41`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_42`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_43`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_44`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_45`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_46`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_47`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_48`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_49`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_50`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_51`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_52`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_53`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_54`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_55`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_56`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_57`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_58`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_59`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_60`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_61`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_62`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_63`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'checkers', 'checkers', '2025-08-27 06:23:02', '2025-08-27 14:39:52', 0, 1);
INSERT INTO `roles` VALUES (2, 'test', 'test', '2025-08-27 06:23:11', '2025-08-27 06:40:31', 1, 1);
INSERT INTO `roles` VALUES (3, 'supertest', 'supertest', '2025-08-27 06:46:30', '2025-08-27 06:46:30', 0, 1);

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  PRIMARY KEY (`session_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('T6btXwqaguRbvwuPcVP1F9K4FRKqpNDM', 1765870443, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2025-12-16T00:35:59.301Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('oQkvlDhGmpsHdkldgo6V6nZLcte7-T31', 1765337440, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2025-12-08T02:12:13.636Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');

-- ----------------------------
-- Table structure for signatories
-- ----------------------------
DROP TABLE IF EXISTS `signatories`;
CREATE TABLE `signatories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `purchase_order_id` int NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `role_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `purchase_order_id`(`purchase_order_id` ASC) USING BTREE,
  INDEX `role_id`(`role_id` ASC) USING BTREE,
  CONSTRAINT `signatories_ibfk_249` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `signatories_ibfk_250` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of signatories
-- ----------------------------
INSERT INTO `signatories` VALUES (1, 'mmeguizo', 'Inspector Officer', NULL, 0, '2025-04-28 07:58:45', '2025-05-07 07:33:41', NULL);
INSERT INTO `signatories` VALUES (2, 'kevin moracas', 'Property And Supply Officer', NULL, 0, '2025-04-28 07:59:36', '2025-04-28 08:43:42', NULL);
INSERT INTO `signatories` VALUES (3, 'tester', 'Recieved From', NULL, 1, '2025-04-28 08:48:41', '2025-04-28 08:49:02', NULL);
INSERT INTO `signatories` VALUES (4, 'ram buyco', 'Recieved From', NULL, 0, '2025-05-06 06:47:39', '2025-05-06 06:47:39', NULL);
INSERT INTO `signatories` VALUES (5, 'tester', 'supertest', NULL, 0, '2025-08-27 06:46:11', '2025-08-27 06:46:39', NULL);
INSERT INTO `signatories` VALUES (6, 'simpletester', 'supertest', NULL, 0, '2025-09-17 06:42:04', '2025-09-17 06:42:04', NULL);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `profile_pic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '',
  `gender` enum('male','female','others') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'male',
  `role` enum('admin','user') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'user',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `last_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '',
  `employee_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '',
  `department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '',
  `position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '',
  `location` enum('Talisay','Fortune Town','Alijis','Binalbagan') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Talisay',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_2`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_3`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_4`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_5`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_6`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_7`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_8`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_9`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_10`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_11`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_12`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_13`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_14`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_15`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_16`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_17`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_18`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_19`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_20`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_21`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_22`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_23`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_24`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_25`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_26`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_27`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_28`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_29`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_30`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_31`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_32`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_33`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_34`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_35`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_36`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_37`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_38`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_39`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_40`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_41`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_42`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_43`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_44`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_45`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_46`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_47`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_48`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_49`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_50`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_51`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_52`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_53`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_54`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_55`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_56`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_57`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_58`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_59`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_60`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_61`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_62`(`email` ASC) USING BTREE,
  UNIQUE INDEX `email_63`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, '$2b$10$QaXozXayLKBz5jykSY./P.R0z5irGh1JUis7RxAzvBzD1gaofDsNO', 'mmeguizo@chmsu.edu.ph', 1, '2025-03-03 18:41:32', '2025-07-07 05:40:53', 'https://avatar.iran.liara.run/public/boy?email=mmeguizo@chmsu.edu.ph', 'male', 'admin', 'Mark Oliver ', 'Meguizo', 'MIS-1', 'MIS', 'System Developer', 'Talisay');
INSERT INTO `users` VALUES (2, '$2b$10$P.NIvdGpRn6IjOW7FviAwuSrOebdGHzkyPRG.xU/qobYlJXlWHdR6', 'test@chmsu.edu.ph', 1, '2025-04-04 02:14:47', '2025-06-17 02:55:31', 'https://avatar.iran.liara.run/public/girl?email=test@chmsu.edu.ph', 'female', 'admin', 'test', 'tester', 'tester123', 'tester', 'supply tester', 'Talisay');
INSERT INTO `users` VALUES (3, '$2b$10$dX.UNfwL3NtFYTv6NusCxe7v7sFTso4jIZd9FKbYMXbno2G2eGBd.', 'gagers@gagers.com', 0, '2025-06-09 06:43:02', '2025-06-17 02:55:15', 'https://avatar.iran.liara.run/public/boy?username=gagers@gagers.com', 'others', 'user', 'gagers', 'gagers', 'gagers1', 'gagers', 'programmer', 'Talisay');
INSERT INTO `users` VALUES (4, '$2b$10$kDj9XBr/r8lbsDcwmABKZucC4dw/0md9JpZtP8KUtd6vaw5yn4pBO', 'tester@chmsu.edu.ph', 1, '2025-06-23 06:38:49', '2025-06-23 06:44:45', 'https://avatar.iran.liara.run/public/boy?username=tester@chmsu.edu.ph', 'others', 'admin', 'alijisSupply', 'alijisSupply', 'alijis-01', 'Supply', 'supply tester', 'Alijis');
INSERT INTO `users` VALUES (5, '$2b$10$vdOqaicuXKGqzRiHF5hwYeAmRdrVjWhuOxYPM6UuxLLnVzo2lJM0q', 'fttester@chmsu.edu.ph', 1, '2025-06-23 06:45:27', '2025-06-23 08:23:45', 'https://avatar.iran.liara.run/public/girl?email=fttester@chmsu.edu.ph', 'female', 'admin', 'FT-user', 'FT-user', 'FT-01', 'Supply', 'supply tester', 'Fortune Town');
INSERT INTO `users` VALUES (6, '$2b$10$jgA31yGeWMS3O.MGIUe7xu6VLZdHr2f3920hqb5g99Eg3lJmbrRli', 'binalbagan-user@chmsu.edu.ph', 1, '2025-06-23 06:47:05', '2025-06-23 06:47:05', 'https://avatar.iran.liara.run/public/boy?email=binalbagan-user@chmsu.edu.ph', 'male', 'admin', 'binalbagan-user', 'binalbagan-user', 'binalbagan01', 'Supply', 'supply tester', 'Binalbagan');
INSERT INTO `users` VALUES (7, '$2b$10$HgCg2w.NkkTpkBgfQhZtzO.dRNFqi1u2YxCSWfmIOgvDQaKVaVdI.', 'benrie.nufable@chmsu.edu.ph', 1, '2025-08-05 03:14:11', '2025-08-05 03:14:11', 'https://avatar.iran.liara.run/public/boy?email=benrie.nufable@chmsu.edu.ph', 'male', 'user', 'benrie james ', 'nufable', 'bjm-01', 'MIS', 'MIS - DPO', 'Talisay');
INSERT INTO `users` VALUES (8, '$2b$10$vZ.dTOH7OL5mtJlDYN3tr.9F4S.kifVHKdX0LdwfliWZv7AH0Y6Ie', 'ram.buyco@chmsu.edu.ph', 1, '2025-08-05 03:15:32', '2025-08-05 03:15:32', 'https://avatar.iran.liara.run/public/boy?email=ram.buyco@chmsu.edu.ph', 'male', 'user', 'Ram', 'Buyco', 'rb-001', 'MIS', 'System Analyst 1', 'Talisay');
INSERT INTO `users` VALUES (9, '$2b$10$UsY.f5z/FNhvHp1gQ/2AU.PLdkURqI/I1zaJ24gkNs3FJeyRbxtVu', 'kevin.morac@chmsu.edu.ph', 1, '2025-08-05 03:16:18', '2025-08-05 03:16:18', 'https://avatar.iran.liara.run/public/boy?email=kevin.morac@chmsu.edu.ph', 'male', 'user', 'Kevin', 'Moraca', 'km-001', 'MIS', 'System Analyst 2', 'Talisay');
INSERT INTO `users` VALUES (10, '$2b$10$/3Grp06yabsHBbigR.tUSOXUmNXysbKNqH4BXNtQE2Ws0QZ2SyIqy', 'johndoe@example.com', 1, '2025-10-02 07:39:41', '2025-10-02 07:39:41', 'https://avatar.iran.liara.run/public/boy?email=johndoe@example.com', 'male', 'user', 'John', 'Doe', '1001', 'IT Officer', 'Developer', 'Talisay');

SET FOREIGN_KEY_CHECKS = 1;
