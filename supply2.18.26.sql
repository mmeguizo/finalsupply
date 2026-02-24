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

 Date: 18/02/2026 15:01:16
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
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `purchase_order_id`(`purchase_order_id` ASC) USING BTREE,
  INDEX `purchase_order_item_id`(`purchase_order_item_id` ASC) USING BTREE,
  CONSTRAINT `inspection_acceptance_report_ibfk_479` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inspection_acceptance_report_ibfk_480` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 435 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of inspection_acceptance_report
-- ----------------------------
INSERT INTO `inspection_acceptance_report` VALUES (425, '', 215, '', 'asdfa', 'dfdf', 210, 340.00, 71400.00, 0, 'inventory custodian slip', 'high', 0, '2026-02-18 14:28:22', '2026-02-18 14:31:34', 287, '', '', '', 'Mark Oliver ', 'Mark Oliver ', '12312', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `inspection_acceptance_report` VALUES (426, '', 215, '', 'asdf', 'tester', 11000, 330.00, 3630000.00, 0, 'inventory custodian slip', 'low', 0, '2026-02-18 14:28:23', '2026-02-18 14:31:01', 288, '', '', '', 'Mark Oliver ', 'Mark Oliver ', '43434', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `inspection_acceptance_report` VALUES (427, '', 215, '', 'asdf', 'tester', 11000, 330.00, 6600.00, 20, 'inventory custodian slip', 'low', 0, '2026-02-18 14:28:35', '2026-02-18 14:28:35', 288, 'SPLV-2026-02-0001', '', '', 'Mark Oliver ', 'Mark Oliver ', '43434', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'simpletester', 'supertest', 'test tester', 'supply tester', 'sdadf', '2026-02-18 14:28:35');
INSERT INTO `inspection_acceptance_report` VALUES (428, '', 215, '', 'asdf', 'tester', 11000, 330.00, 6600.00, 20, 'inventory custodian slip', 'low', 0, '2026-02-18 14:31:00', '2026-02-18 14:31:00', 288, 'SPLV-2026-02-0002', '', '', 'Mark Oliver ', 'Mark Oliver ', '43434', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ram buyco', 'Recieved From', 'Ram Buyco', 'System Analyst 1', 'uiuiuiudaf', '2026-02-18 14:31:00');
INSERT INTO `inspection_acceptance_report` VALUES (429, '', 215, '', 'asdfa', 'dfdf', 210, 340.00, 5100.00, 15, 'inventory custodian slip', 'high', 0, '2026-02-18 14:31:13', '2026-02-18 14:31:13', 287, 'SPHV-2026-02-0002', '', '', 'Mark Oliver ', 'Mark Oliver ', '12312', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'kevin moracas', 'Property And Supply Officer', 'Kevin Moraca', 'System Analyst 2', 'popopop', '2026-02-18 14:31:13');
INSERT INTO `inspection_acceptance_report` VALUES (430, '', 215, '', 'asdfa', 'dfdf', 210, 340.00, 5100.00, 15, 'inventory custodian slip', 'high', 0, '2026-02-18 14:31:34', '2026-02-18 14:43:00', 287, 'SPHV-2026-02-0003', '', '', 'Mark Oliver ', 'Mark Oliver ', '12312', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'kevin moracas', 'Property And Supply Officer', 'Kevin Moraca', 'System Analyst 2', 'opopopopop', '2026-02-18 14:31:34');
INSERT INTO `inspection_acceptance_report` VALUES (431, '', 215, '', 'sadfsa', 'gfg', 220, 20.00, 4400.00, 5, 'property acknowledgement reciept', '', 0, '2026-02-18 14:39:03', '2026-02-18 14:39:17', 289, '', '', '', 'Mark Oliver ', 'Mark Oliver ', '12312', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `inspection_acceptance_report` VALUES (432, '', 215, '', 'sadfsa', 'gfg', 220, 20.00, 100.00, 5, 'property acknowledgement reciept', '', 0, '2026-02-18 14:39:17', '2026-02-18 14:39:34', 289, '', '', '26-003', 'Mark Oliver ', 'Mark Oliver ', '12312', 'none', NULL, NULL, NULL, NULL, NULL, 'ram buyco', 'Recieved From', 'Ram Buyco', 'System Analyst 1', 'cxcxccxcx', '2026-02-18 14:39:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `inspection_acceptance_report` VALUES (433, '', 215, '', 'sadfsad', 'ewewe', 890, 70.00, 62300.00, 10, 'requisition issue slip', '', 0, '2026-02-18 14:40:05', '2026-02-18 14:40:22', 290, '', '', '', 'Mark Oliver ', 'Mark Oliver ', '131231', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `inspection_acceptance_report` VALUES (434, '', 215, '', 'sadfsad', 'ewewe', 890, 70.00, 700.00, 10, 'requisition issue slip', '', 0, '2026-02-18 14:40:22', '2026-02-18 14:40:30', 290, '', '2026-02-0003', '', 'Mark Oliver ', 'Mark Oliver ', '131231', 'none', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'simpletester', 'supertest', 'John Doe', 'Developer', 'opopopopo', '2026-02-18 14:40:22', NULL, NULL, NULL, NULL, NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 291 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of purchase_order_items
-- ----------------------------
INSERT INTO `purchase_order_items` VALUES (287, 215, '', 'asdfa', 'sdfasd', 'sdfa', 'dfdf', 210, 340.00, 71400.00, 30, 'inventory custodian slip', '2026-02-18 14:28:22', '2026-02-18 14:40:05', 0, 'high', NULL, '12312', '72vko76oo0', 0);
INSERT INTO `purchase_order_items` VALUES (288, 215, '', 'asdf', 'asdfas', 'asdf', 'tester', 11000, 330.00, 3630000.00, 40, 'inventory custodian slip', '2026-02-18 14:28:23', '2026-02-18 14:40:05', 0, 'low', NULL, '43434', '32ekmr3040', 0);
INSERT INTO `purchase_order_items` VALUES (289, 215, '', 'sadfsa', 'fasdf', 'dfasd', 'gfg', 220, 20.00, 4400.00, 10, 'property acknowledgement reciept', '2026-02-18 14:39:03', '2026-02-18 14:40:05', 0, 'none', NULL, '12312', '0i37r1ll65', 0);
INSERT INTO `purchase_order_items` VALUES (290, 215, '', 'sadfsad', 'fasdfsdaf', 'fsdafsad', 'ewewe', 890, 70.00, 62300.00, 20, 'requisition issue slip', '2026-02-18 14:40:04', '2026-02-18 14:40:04', 0, 'none', NULL, '131231', 'ezmu25ll5o', 0);

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
) ENGINE = InnoDB AUTO_INCREMENT = 488 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of purchase_order_items_history
-- ----------------------------
INSERT INTO `purchase_order_items_history` VALUES (479, 287, 0, 210, 0, 30, 0.00, 71400.00, 'quantity_update', 'Mark Oliver ', 'Initial item creation with received quantity', '2026-02-18 14:28:22', '2026-02-18 14:28:22', 215, '', 'asdfa', '', '', '', '');
INSERT INTO `purchase_order_items_history` VALUES (480, 288, 0, 11000, 0, 40, 0.00, 3630000.00, 'quantity_update', 'Mark Oliver ', 'Initial item creation with received quantity', '2026-02-18 14:28:23', '2026-02-18 14:28:23', 215, '', 'asdf', '', '', '', '');
INSERT INTO `purchase_order_items_history` VALUES (481, 289, 0, 220, 0, 10, 0.00, 4400.00, 'item_creation', 'Mark Oliver ', 'Initial item creation', '2026-02-18 14:39:03', '2026-02-18 14:39:03', 215, '', 'sadfsa', '', '', '', '');
INSERT INTO `purchase_order_items_history` VALUES (482, 287, 210, 210, 30, 30, 71400.00, 71400.00, 'item_details_update', 'Mark Oliver ', 'Updated item details', '2026-02-18 14:39:03', '2026-02-18 14:39:03', 215, '', 'asdfa', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (483, 288, 11000, 11000, 40, 40, 3630000.00, 3630000.00, 'item_details_update', 'Mark Oliver ', 'Updated item details', '2026-02-18 14:39:03', '2026-02-18 14:39:03', 215, '', 'asdf', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (484, 290, 0, 890, 0, 20, 0.00, 62300.00, 'item_creation', 'Mark Oliver ', 'Initial item creation', '2026-02-18 14:40:05', '2026-02-18 14:40:05', 215, '', 'sadfsad', '', '', '', '');
INSERT INTO `purchase_order_items_history` VALUES (485, 287, 210, 210, 30, 30, 71400.00, 71400.00, 'item_details_update', 'Mark Oliver ', 'Updated item details', '2026-02-18 14:40:05', '2026-02-18 14:40:05', 215, '', 'asdfa', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (486, 288, 11000, 11000, 40, 40, 3630000.00, 3630000.00, 'item_details_update', 'Mark Oliver ', 'Updated item details', '2026-02-18 14:40:05', '2026-02-18 14:40:05', 215, '', 'asdf', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (487, 289, 220, 220, 10, 10, 4400.00, 4400.00, 'item_details_update', 'Mark Oliver ', 'Updated item details', '2026-02-18 14:40:05', '2026-02-18 14:40:05', 215, '', 'sadfsa', NULL, NULL, NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 216 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of purchase_orders
-- ----------------------------
INSERT INTO `purchase_orders` VALUES (215, '0607-234-25-B', '12312', 'MIS-DPO', '2026-02-20', '2026-02-18', '2026-02-18', '2', '6565656', 3705800.00, 'pending', 0, '2026-02-18 14:28:22', '2026-02-18 14:40:04', 'bacolod paper', 'talisay city, Negros Occidental, 6115, PH', NULL, '888', NULL, NULL, 'Talisay', 'flood control', NULL, NULL, NULL);

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
INSERT INTO `sessions` VALUES ('ulyX7OuSK6gi2n3Y0UwwVlO1tjFSAC5v', 1772002691, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-02-25T01:05:12.202Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');

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
  CONSTRAINT `signatories_ibfk_427` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `signatories_ibfk_428` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
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
