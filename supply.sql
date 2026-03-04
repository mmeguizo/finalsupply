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

 Date: 27/02/2026 10:06:36
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
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
  `invoice` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Invoice number specific to this IAR receipt',
  `invoice_date` date NULL DEFAULT NULL COMMENT 'Invoice date specific to this IAR receipt',
  `income` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Income info specific to this IAR',
  `mds` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'MDS info specific to this IAR',
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Details specific to this IAR',
  `par_received_from` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'PAR signatory - Received From name',
  `par_received_from_position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'PAR signatory - Received From position/role',
  `par_received_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'PAR signatory - Received By name',
  `par_received_by_position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'PAR signatory - Received By position',
  `par_department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Department assigned for this PAR item',
  `par_assigned_date` datetime NULL DEFAULT NULL COMMENT 'Date when PAR ID was assigned',
  `ris_received_from` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'RIS signatory - Received From name',
  `ris_received_from_position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'RIS signatory - Received From position/role',
  `ris_received_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'RIS signatory - Received By name',
  `ris_received_by_position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'RIS signatory - Received By position',
  `ris_department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Department assigned for this RIS item',
  `ris_assigned_date` datetime NULL DEFAULT NULL COMMENT 'Date when RIS ID was assigned',
  `ics_received_from` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'ICS signatory - Received From name',
  `ics_received_from_position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'ICS signatory - Received From position/role',
  `ics_received_by` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'ICS signatory - Received By name',
  `ics_received_by_position` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'ICS signatory - Received By position',
  `ics_department` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Department assigned for this ICS item',
  `ics_assigned_date` datetime NULL DEFAULT NULL COMMENT 'Date when ICS ID was assigned',
  `purpose` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Purpose field for ICS/RIS print reports (manually entered)',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Remarks field for PAR print reports (manually entered)',
  `split_group_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Shared ID among all items created from the same split operation. Traces siblings.',
  `split_from_item_id` int NULL DEFAULT NULL COMMENT 'The original IAR item ID this record was split from. Traces back to source.',
  `split_index` int NULL DEFAULT NULL COMMENT '1-based index within the split group (1 = first split, etc.)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `purchase_order_id`(`purchase_order_id` ASC) USING BTREE,
  INDEX `purchase_order_item_id`(`purchase_order_item_id` ASC) USING BTREE,
  CONSTRAINT `inspection_acceptance_report_ibfk_687` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inspection_acceptance_report_ibfk_688` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 497 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of inspection_acceptance_report
-- ----------------------------

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
  `category` enum('property acknowledgement reciept','inventory custodian slip','requisition issue slip') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_deleted` tinyint(1) NULL DEFAULT 0,
  `tag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'none',
  `iar_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `inventory_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'none',
  `item_group_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Stable grouping key for logical item across updates/receipts',
  `is_receipt_line` tinyint(1) NULL DEFAULT 0 COMMENT 'Optional marker for cloned receipt-only lines',
  `delivery_status` enum('pending','delivered','partial') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending' COMMENT 'Track item delivery status independently of IAR receipt',
  `delivered_date` date NULL DEFAULT NULL COMMENT 'Date when item was delivered',
  `delivery_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Notes about the delivery (e.g. follow-up needed, backordered)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `purchase_order_id`(`purchase_order_id` ASC) USING BTREE,
  CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 324 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of purchase_order_items
-- ----------------------------

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
) ENGINE = InnoDB AUTO_INCREMENT = 543 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of purchase_order_items_history
-- ----------------------------

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
  `tin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Tax Identification Number of the supplier',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 233 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of purchase_orders
-- ----------------------------

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
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('0fSfO7eg9hbEanN3c_wXIuG0Vok15YMZ', 1772527173, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T08:39:32.761Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('2_79Ts5wIR592MxNk_Ji9w8YeSIwWVVG', 1772523972, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T07:46:11.792Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('4Z0QWdV8VZFIAv_Aq90fc81GPKvC7JZN', 1772526946, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T08:35:46.187Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('4kk0LZ1VP7LE4VRIyXVO9OdRc07IoFmN', 1772524211, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T07:50:10.748Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('5p1J2le0oUlWJZwPfjUl68fjBTTcFqDG', 1772523933, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T07:45:33.465Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('971dd4JQdUJtDC8meGYTUbI_zsbwz-2l', 1772696177, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-04T00:37:26.570Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":2}}');
INSERT INTO `sessions` VALUES ('BIrcaRyjUVGhcGVFoaILNBpR0ZQjoW8X', 1772523939, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T07:45:39.385Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('I0zQ48sq-bfqp4HkK4oigNfpuGLkHJey', 1772583828, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-04T00:23:48.067Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('IxEFFQkYoVsl9MJ5r-d6I35eGN2dbr1v', 1772523966, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T07:46:05.691Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('QPc8MuWDXrBHwib-XIdsGrB5umG0C4Sb', 1772759984, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-04T00:23:26.104Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('TGNCLTW1qqkmV7LAtDnrPg3PszVAFsuj', 1772524003, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T07:46:42.759Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('_bJTCI7PPTpMl0PxgiBb-C9O-e_LuPl-', 1772523937, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T07:45:36.544Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('az-R4sttsXW_fllsuTYCNEJal1VTtq1e', 1772585187, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T08:40:53.312Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":2}}');
INSERT INTO `sessions` VALUES ('h0iaIhOCvka5Fu8lHS3UQazPs44uq76H', 1772524022, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-03T07:47:01.761Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":2}}');
INSERT INTO `sessions` VALUES ('rCaP3tgxvTV96evg6JN2hlauK40Y0g83', 1772583670, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-03-04T00:16:54.187Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');

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
  CONSTRAINT `signatories_ibfk_633` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `signatories_ibfk_634` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 51 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

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
