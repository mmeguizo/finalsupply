/*
 Navicat Premium Data Transfer

 Source Server         : newIDM
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : supply

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 16/01/2026 12:01:17
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
  UNIQUE INDEX `name_61`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_62`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_63`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of department
-- ----------------------------
INSERT INTO `department` VALUES (1, 'MIS', 'MIS department under ICT ni sir russel', 1, '2025-07-07 00:00:00', '2025-07-07 00:00:00');
INSERT INTO `department` VALUES (2, 'tester', 'tester', NULL, '2025-07-07 00:00:00', '2025-07-07 00:00:00');
INSERT INTO `department` VALUES (3, 'IT Officer', 'IT Officer under ICT', 1, '2025-07-07 00:00:00', '2025-07-07 00:00:00');
INSERT INTO `department` VALUES (4, 'Supply', 'Supply office', 1, '2025-08-05 00:00:00', '2025-08-05 00:00:00');
INSERT INTO `department` VALUES (5, 'HRMO', 'HRMO', 1, '2025-09-17 01:24:17', '2026-01-06 03:39:41');

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
  CONSTRAINT `inspection_acceptance_report_ibfk_167` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inspection_acceptance_report_ibfk_168` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 290 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_acceptance_report
-- ----------------------------
INSERT INTO `inspection_acceptance_report` VALUES (276, '120125-001-AI', 106, '', 'Laptop', 'pcs', 100, 55000.00, 5500000.00, 5, 'property acknowledgement reciept', '', 0, '2025-12-01 01:05:20', '2025-12-01 01:05:42', 224, '', '', '25-001A', 'test', 'test', '', 'none');
INSERT INTO `inspection_acceptance_report` VALUES (277, '120125-002-BI', 107, '', 'Computer', 'pcs', 10, 60000.00, 600000.00, 3, 'property acknowledgement reciept', '', 0, '2025-12-01 01:12:29', '2025-12-01 01:15:45', 225, '', '', '25-002B', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (278, '120125-003-BI', 107, '', 'Computer', 'pcs', 10, 60000.00, 600000.00, 2, 'property acknowledgement reciept', '', 0, '2025-12-01 01:12:29', '2025-12-01 01:16:26', 225, '', '', '25-003B', 'test', 'test', '', 'none');
INSERT INTO `inspection_acceptance_report` VALUES (279, '011626-001-TI', 108, '', 'OFFICE TABLE', 'UNIT', 5, 75000.00, 375000.00, 5, 'property acknowledgement reciept', '', 0, '2026-01-16 01:12:03', '2026-01-16 01:12:15', 226, '', '', '26-001T', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (280, '011626-001-TI', 108, '', 'PAPER', 'ream', 199, 200.00, 39800.00, 100, 'requisition issue slip', '', 0, '2026-01-16 01:12:03', '2026-01-16 01:12:15', 227, '', '2026-01-0001T', '', 'test', 'test', '048', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (281, '011626-001-TI', 108, '', 'keyboard', 'pc', 5, 700.00, 3500.00, 5, 'inventory custodian slip', 'low', 0, '2026-01-16 01:12:03', '2026-01-16 01:12:15', 228, 'SPLV-2026-01-0001T', '', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (282, '011626-001-TI', 108, '', 'Laptop', 'unit', 5, 48000.00, 240000.00, 1, 'inventory custodian slip', 'high', 0, '2026-01-16 01:12:03', '2026-01-16 01:12:15', 229, 'SPLV-2026-01-0001T', '', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (283, '011626-001-TI', 108, '', 'Anesthesia', 'boxes', 15, 1780.00, 26700.00, 5, 'requisition issue slip', '', 0, '2026-01-16 01:12:03', '2026-01-16 01:12:15', 230, '', '2026-01-0001T', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (284, '011626-002-TI', 108, '', 'scanner', 'unit', 4, 52000.00, 208000.00, 2, 'property acknowledgement reciept', '', 0, '2026-01-16 01:21:12', '2026-01-16 01:22:06', 231, '', '', '26-002T', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (285, '011626-003-TI', 108, '', 'PAPER', 'ream', 199, 200.00, 39800.00, 99, 'requisition issue slip', '', 0, '2026-01-16 01:12:03', '2026-01-16 01:51:00', 227, '', '2026-01-0002T', '', 'test', 'test', '048', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (286, '011626-003-TI', 108, '', 'Laptop', 'unit', 5, 48000.00, 240000.00, 4, 'inventory custodian slip', 'high', 0, '2026-01-16 01:12:03', '2026-01-16 01:51:00', 229, 'SPHV-2026-01-0001T', '', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (287, '011626-003-TI', 108, '', 'Anesthesia', 'boxes', 15, 1780.00, 26700.00, 5, 'requisition issue slip', '', 0, '2026-01-16 01:12:03', '2026-01-16 01:51:00', 230, '', '2026-01-0002T', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (288, '011626-003-TI', 108, '', 'scanner', 'unit', 4, 52000.00, 208000.00, 2, 'property acknowledgement reciept', 'none', 0, '2026-01-16 01:21:12', '2026-01-16 01:51:00', 231, '', '', '26-003T', 'test', 'test', 'none', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (289, '011626-004-TI', 108, '', 'Anesthesia', 'boxes', 15, 1780.00, 26700.00, 5, 'requisition issue slip', '', 0, '2026-01-16 01:12:03', '2026-01-16 02:03:58', 230, '', '2026-01-0002T', '', 'test', 'test', '', 'complete');

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
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_purchase_order_id`(`purchase_order_id` ASC) USING BTREE,
  CONSTRAINT `purchase_order_items_ibfk_1` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 232 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_order_items
-- ----------------------------
INSERT INTO `purchase_order_items` VALUES (224, 106, '', 'Laptop', '', 'i7', 'pcs', 100, 55000.00, 5500000.00, 5, 'property acknowledgement reciept', '2025-12-01 01:05:20', '2025-12-01 01:05:42', 0, '', NULL, '');
INSERT INTO `purchase_order_items` VALUES (225, 107, '', 'Computer', '123\n456\n789', 'i5', 'pcs', 10, 60000.00, 600000.00, 5, 'property acknowledgement reciept', '2025-12-01 01:12:29', '2025-12-01 01:16:26', 0, '', NULL, '');
INSERT INTO `purchase_order_items` VALUES (226, 108, '', 'OFFICE TABLE', 'DD', 'DDD', 'UNIT', 5, 75000.00, 375000.00, 5, 'property acknowledgement reciept', '2026-01-16 01:12:03', '2026-01-16 02:03:35', 0, '', NULL, '');
INSERT INTO `purchase_order_items` VALUES (227, 108, '', 'PAPER', 'A4', 'Multicopy', 'ream', 199, 200.00, 39800.00, 199, 'requisition issue slip', '2026-01-16 01:12:03', '2026-01-16 02:03:35', 0, '', NULL, '048');
INSERT INTO `purchase_order_items` VALUES (228, 108, '', 'keyboard', 'ddd', 'ddd', 'pc', 5, 700.00, 3500.00, 5, 'inventory custodian slip', '2026-01-16 01:12:03', '2026-01-16 02:03:35', 0, 'low', NULL, '');
INSERT INTO `purchase_order_items` VALUES (229, 108, '', 'Laptop', 'bbb', 'bbbb', 'unit', 5, 48000.00, 240000.00, 5, 'inventory custodian slip', '2026-01-16 01:12:03', '2026-01-16 02:03:35', 0, 'high', NULL, '');
INSERT INTO `purchase_order_items` VALUES (230, 108, '', 'Anesthesia', 'Dental Injection', 'Crysta FD / FD Zeyco', 'boxes', 15, 1780.00, 26700.00, 15, 'requisition issue slip', '2026-01-16 01:12:03', '2026-01-16 02:03:36', 0, '', NULL, '');
INSERT INTO `purchase_order_items` VALUES (231, 108, '', 'scanner', 'dd', 'dd', 'unit', 4, 52000.00, 208000.00, 4, 'property acknowledgement reciept', '2026-01-16 01:21:12', '2026-01-16 02:03:36', 0, 'none', NULL, 'none');

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
) ENGINE = InnoDB AUTO_INCREMENT = 306 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_order_items_history
-- ----------------------------
INSERT INTO `purchase_order_items_history` VALUES (279, 224, 100, 100, 0, 5, 5500000.00, 5500000.00, 'received_update', 'test', 'Received quantity update', '2025-12-01 01:05:42', '2025-12-01 01:05:42', 106, '', 'Laptop', '120125-001-AI', '25-001A', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (280, 225, 0, 10, 0, 3, 0.00, 600000.00, 'quantity_update', 'test', 'Initial item creation with received quantity', '2025-12-01 01:12:29', '2025-12-01 01:12:29', 107, '', 'Computer', '120125-002-BI', '25-002B', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (281, 225, 10, 10, 3, 5, 600000.00, 600000.00, 'received_update', 'test', 'Received quantity update', '2025-12-01 01:16:26', '2025-12-01 01:16:26', 107, '', 'Computer', '120125-003-BI', '25-003B', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (282, 226, 0, 5, 0, 5, 0.00, 375000.00, 'quantity_update', 'test', 'Initial item creation with received quantity', '2026-01-16 01:12:03', '2026-01-16 01:12:03', 108, '', 'OFFICE TABLE', '011626-001-TI', '26-001T', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (283, 227, 0, 199, 0, 100, 0.00, 39800.00, 'quantity_update', 'test', 'Initial item creation with received quantity', '2026-01-16 01:12:03', '2026-01-16 01:12:03', 108, '', 'PAPER', '011626-001-TI', NULL, '2026-01-0001T', NULL);
INSERT INTO `purchase_order_items_history` VALUES (284, 228, 0, 5, 0, 5, 0.00, 3500.00, 'quantity_update', 'test', 'Initial item creation with received quantity', '2026-01-16 01:12:03', '2026-01-16 01:12:03', 108, '', 'keyboard', '011626-001-TI', NULL, NULL, 'SPLV-2026-01-0001T');
INSERT INTO `purchase_order_items_history` VALUES (285, 229, 0, 5, 0, 1, 0.00, 240000.00, 'quantity_update', 'test', 'Initial item creation with received quantity', '2026-01-16 01:12:03', '2026-01-16 01:12:03', 108, '', 'Laptop', '011626-001-TI', NULL, NULL, 'SPLV-2026-01-0001T');
INSERT INTO `purchase_order_items_history` VALUES (286, 230, 0, 15, 0, 5, 0.00, 26700.00, 'quantity_update', 'test', 'Initial item creation with received quantity', '2026-01-16 01:12:03', '2026-01-16 01:12:03', 108, '', 'Anesthesia', '011626-001-TI', NULL, '2026-01-0001T', NULL);
INSERT INTO `purchase_order_items_history` VALUES (287, 231, 0, 4, 0, 2, 0.00, 208000.00, 'item_creation', 'test', 'Initial item creation', '2026-01-16 01:21:12', '2026-01-16 01:21:12', 108, '', 'scanner', '011626-002-TI', '26-002T', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (288, 226, 5, 5, 5, 5, 375000.00, 375000.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 01:21:12', '2026-01-16 01:21:12', 108, '', 'OFFICE TABLE', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (289, 227, 199, 199, 100, 100, 39800.00, 39800.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 01:21:12', '2026-01-16 01:21:12', 108, '', 'PAPER', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (290, 228, 5, 5, 5, 5, 3500.00, 3500.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 01:21:12', '2026-01-16 01:21:12', 108, '', 'keyboard', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (291, 229, 5, 5, 1, 1, 240000.00, 240000.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 01:21:13', '2026-01-16 01:21:13', 108, '', 'Laptop', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (292, 230, 15, 15, 5, 5, 26700.00, 26700.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 01:21:13', '2026-01-16 01:21:13', 108, '', 'Anesthesia', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (293, 226, 5, 5, 5, 5, 375000.00, 375000.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 01:50:12', '2026-01-16 01:50:12', 108, '', 'OFFICE TABLE', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (294, 227, 199, 199, 100, 199, 39800.00, 39800.00, 'received_update', 'test', 'Received quantity update', '2026-01-16 01:50:12', '2026-01-16 01:50:12', 108, '', 'PAPER', '011626-003-TI', NULL, '2026-01-0002T', NULL);
INSERT INTO `purchase_order_items_history` VALUES (295, 228, 5, 5, 5, 5, 3500.00, 3500.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 01:50:12', '2026-01-16 01:50:12', 108, '', 'keyboard', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (296, 229, 5, 5, 1, 5, 240000.00, 240000.00, 'received_update', 'test', 'Received quantity update', '2026-01-16 01:50:13', '2026-01-16 01:50:13', 108, '', 'Laptop', '011626-003-TI', NULL, NULL, 'SPHV-2026-01-0001T');
INSERT INTO `purchase_order_items_history` VALUES (297, 230, 15, 15, 5, 10, 26700.00, 26700.00, 'received_update', 'test', 'Received quantity update', '2026-01-16 01:50:13', '2026-01-16 01:50:13', 108, '', 'Anesthesia', '011626-003-TI', NULL, '2026-01-0002T', NULL);
INSERT INTO `purchase_order_items_history` VALUES (298, 231, 4, 4, 2, 4, 208000.00, 208000.00, 'received_update', 'test', 'Received quantity update', '2026-01-16 01:50:13', '2026-01-16 01:50:13', 108, '', 'scanner', '011626-003-TI', '26-003T', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (299, 226, 5, 5, 5, 5, 375000.00, 375000.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 02:03:35', '2026-01-16 02:03:35', 108, '', 'OFFICE TABLE', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (300, 227, 199, 199, 199, 199, 39800.00, 39800.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 02:03:35', '2026-01-16 02:03:35', 108, '', 'PAPER', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (301, 228, 5, 5, 5, 5, 3500.00, 3500.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 02:03:35', '2026-01-16 02:03:35', 108, '', 'keyboard', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (302, 229, 5, 5, 5, 5, 240000.00, 240000.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 02:03:35', '2026-01-16 02:03:35', 108, '', 'Laptop', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (303, 230, 15, 15, 10, 15, 26700.00, 26700.00, 'received_update', 'test', 'Received quantity update', '2026-01-16 02:03:36', '2026-01-16 02:03:36', 108, '', 'Anesthesia', '011626-004-TI', NULL, '2026-01-0002T', NULL);
INSERT INTO `purchase_order_items_history` VALUES (304, 231, 4, 4, 4, 4, 208000.00, 208000.00, 'item_details_update', 'test', 'Updated item details (no quantity received)', '2026-01-16 02:03:36', '2026-01-16 02:03:36', 108, '', 'scanner', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (305, 226, 5, 5, 5, 5, 375000.00, 375000.00, 'po_completed', 'test', 'Purchase Order Marked Complete', '2026-01-16 02:04:30', '2026-01-16 02:04:30', NULL, '', NULL, NULL, NULL, NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 109 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_orders
-- ----------------------------
INSERT INTO `purchase_orders` VALUES (106, '145', '', 'PSMO', '2025-12-16', '2025-12-01', '2025-12-01', '15', '', 5500000.00, 'pending', 0, '2025-12-01 01:05:20', '2025-12-01 01:07:37', 'Chinamart', '', NULL, '', NULL, NULL, 'Alijis', 'GAA', NULL, '12-05-006', NULL);
INSERT INTO `purchase_orders` VALUES (107, '125', '', 'HRMO', '2025-12-16', '2025-12-01', '2025-12-01', '15', '', 600000.00, 'pending', 0, '2025-12-01 01:12:29', '2025-12-01 01:16:25', 'Hardy', '', NULL, '', NULL, NULL, 'Binalbagan', 'GAA', NULL, '154036', NULL);
INSERT INTO `purchase_orders` VALUES (108, '1014-542-25', 'NEGOTIATED PROCUREMENT ', 'Medical Clinic', '2026-02-19', '2026-01-16', '2026-01-20', '30', '30', 893000.00, 'completed', 0, '2026-01-16 01:12:03', '2026-01-16 02:04:30', 'SEVEN HARVESTS TRADING', 'BACOLOD CITY', NULL, '', NULL, '2026-01-16', 'Talisay', 'INCOME', 'xxx', NULL, 'Income Procurement of Various Medicines and Equipment (D. Requina)');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NULL DEFAULT 0,
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
  UNIQUE INDEX `name_61`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_62`(`name` ASC) USING BTREE,
  UNIQUE INDEX `name_63`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'checkers', 'checkers', 1, 1, '2025-08-28 11:55:05', '2025-08-28 04:04:07');
INSERT INTO `roles` VALUES (2, 'Checker', 'Checker', 1, 0, '2025-08-28 04:04:02', '2025-08-28 04:04:02');
INSERT INTO `roles` VALUES (3, 'Reciever', 'Reciever', 1, 0, '2025-08-28 04:04:13', '2025-08-28 04:04:13');
INSERT INTO `roles` VALUES (4, 'Quality Checker', 'Quality Checker', 1, 0, '2025-08-28 04:04:20', '2025-08-28 04:04:20');
INSERT INTO `roles` VALUES (5, 'Inspector', 'Inspector', 1, 0, '2025-08-28 04:04:27', '2025-08-28 04:04:27');
INSERT INTO `roles` VALUES (6, 'SUPPLY OFFICER III', '', 1, 0, '2025-09-17 01:26:35', '2025-09-17 01:26:35');
INSERT INTO `roles` VALUES (7, 'SUPPLY OFFICE STAFF', '', 1, 0, '2025-09-17 01:28:02', '2025-09-17 01:28:02');

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
INSERT INTO `sessions` VALUES ('X1lwQHXAirbOogF-w4QZa6lwRWtEO_ko', 1769133930, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-01-23T01:07:09.355Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":2}}');
INSERT INTO `sessions` VALUES ('XzXJnKbVC-8zxc5VMbK4lQROg37nxtXr', 1769049280, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-01-15T03:47:25.655Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');
INSERT INTO `sessions` VALUES ('wHo7wa77NRqGGulS2gL-vns8ylDqfelk', 1769140792, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-01-23T03:09:21.712Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');

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
  CONSTRAINT `signatories_ibfk_123` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `signatories_ibfk_124` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of signatories
-- ----------------------------
INSERT INTO `signatories` VALUES (6, 'Kevin Moraca', 'Quality Checker', NULL, 0, '2025-08-28 04:04:52', '2025-08-28 04:04:52', NULL);
INSERT INTO `signatories` VALUES (7, 'Ram Buyco', 'Inspector', NULL, 0, '2025-08-28 04:05:04', '2025-08-28 04:05:04', NULL);
INSERT INTO `signatories` VALUES (8, 'MA. KRISTINA MEDALLA', 'Reciever', NULL, 0, '2025-09-17 01:00:03', '2025-09-17 01:00:03', NULL);
INSERT INTO `signatories` VALUES (9, 'MA. KRISTINA MEDALLA', 'Reciever', NULL, 0, '2025-09-17 01:22:32', '2025-09-17 01:22:32', NULL);
INSERT INTO `signatories` VALUES (10, 'LEONARD A. GUILARAN', 'SUPPLY OFFICER III', NULL, 0, '2025-09-17 01:26:49', '2025-09-17 01:26:49', NULL);
INSERT INTO `signatories` VALUES (11, 'PAOLO EMMANUEL CRUZ', 'SUPPLY OFFICE STAFF', NULL, 0, '2025-09-17 01:28:17', '2025-09-17 01:28:17', NULL);

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
  UNIQUE INDEX `email_36`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, '$2b$10$QaXozXayLKBz5jykSY./P.R0z5irGh1JUis7RxAzvBzD1gaofDsNO', 'mmeguizo@chmsu.edu.ph', 1, '2025-03-03 00:00:00', '2025-07-07 00:00:00', 'https://avatar.iran.liara.run/public/boy?email=mmeguizo@chmsu.edu.ph', 'male', 'admin', 'Mark Oliver', 'Meguizo', 'MIS-1', 'MIS', 'System Developer', 'Talisay');
INSERT INTO `users` VALUES (2, '$2b$10$P.NIvdGpRn6IjOW7FviAwuSrOebdGHzkyPRG.xU/qobYlJXlWHdR6', 'test@chmsu.edu.ph', 1, '2025-04-04 00:00:00', '2025-06-17 00:00:00', 'https://avatar.iran.liara.run/public/girl?email=test@chmsu.edu.ph', 'female', 'admin', 'test', 'tester', 'tester123', 'tester', 'supply tester', 'Talisay');
INSERT INTO `users` VALUES (3, '$2b$10$dX.UNfwL3NtFYTv6NusCxe7v7sFTso4jIZd9FKbYMXbno2G2eGBd.', 'gagers@gagers.com', NULL, '2025-06-09 00:00:00', '2025-06-17 00:00:00', 'https://avatar.iran.liara.run/public/boy?username=gagers@gagers.com', 'others', 'user', 'gagers', 'gagers', 'gagers1', 'gagers', 'programmer', 'Talisay');
INSERT INTO `users` VALUES (4, '$2b$10$kDj9XBr/r8lbsDcwmABKZucC4dw/0md9JpZtP8KUtd6vaw5yn4pBO', 'tester@chmsu.edu.ph', 1, '2025-06-23 00:00:00', '2025-06-23 00:00:00', 'https://avatar.iran.liara.run/public/boy?username=tester@chmsu.edu.ph', 'others', 'admin', 'alijisSupply', 'alijisSupply', 'alijis-01', 'Supply', 'supply tester', 'Alijis');
INSERT INTO `users` VALUES (5, '$2b$10$vdOqaicuXKGqzRiHF5hwYeAmRdrVjWhuOxYPM6UuxLLnVzo2lJM0q', 'fttester@chmsu.edu.ph', 1, '2025-06-23 00:00:00', '2025-06-23 00:00:00', 'https://avatar.iran.liara.run/public/girl?email=fttester@chmsu.edu.ph', 'female', 'admin', 'FT-user', 'FT-user', 'FT-01', 'Supply', 'supply tester', 'Fortune Town');
INSERT INTO `users` VALUES (6, '$2b$10$jgA31yGeWMS3O.MGIUe7xu6VLZdHr2f3920hqb5g99Eg3lJmbrRli', 'binalbagan-user@chmsu.edu.ph', 1, '2025-06-23 00:00:00', '2025-06-23 00:00:00', 'https://avatar.iran.liara.run/public/boy?email=binalbagan-user@chmsu.edu.ph', 'male', 'admin', 'binalbagan-user', 'binalbagan-user', 'binalbagan01', 'Supply', 'supply tester', 'Binalbagan');
INSERT INTO `users` VALUES (7, '$2b$10$HgCg2w.NkkTpkBgfQhZtzO.dRNFqi1u2YxCSWfmIOgvDQaKVaVdI.', 'benrie.nufable@chmsu.edu.ph', 1, '2025-08-05 00:00:00', '2025-08-05 00:00:00', 'https://avatar.iran.liara.run/public/boy?email=benrie.nufable@chmsu.edu.ph', 'male', 'user', 'benrie james', 'nufable', 'bjm-01', 'MIS', 'MIS - DPO', 'Talisay');
INSERT INTO `users` VALUES (8, '$2b$10$vZ.dTOH7OL5mtJlDYN3tr.9F4S.kifVHKdX0LdwfliWZv7AH0Y6Ie', 'ram.buyco@chmsu.edu.ph', 1, '2025-08-05 00:00:00', '2025-08-05 00:00:00', 'https://avatar.iran.liara.run/public/boy?email=ram.buyco@chmsu.edu.ph', 'male', 'user', 'Ram', 'Buyco', 'rb-001', 'MIS', 'System Analyst 1', 'Talisay');
INSERT INTO `users` VALUES (9, '$2b$10$UsY.f5z/FNhvHp1gQ/2AU.PLdkURqI/I1zaJ24gkNs3FJeyRbxtVu', 'kevin.morac@chmsu.edu.ph', 1, '2025-08-05 00:00:00', '2025-08-05 00:00:00', 'https://avatar.iran.liara.run/public/boy?email=kevin.morac@chmsu.edu.ph', 'male', 'user', 'Kevin', 'Moraca', 'km-001', 'MIS', 'System Analyst 2', 'Talisay');
INSERT INTO `users` VALUES (10, '$2b$10$AztlNPHTXKqgmaYd7dp2sOYMMqYB/YEPXYtdqareZw/VfZb6rlSKu', 'NA@NA.COM', 1, '2025-09-17 01:25:52', '2025-09-17 01:25:52', 'https://avatar.iran.liara.run/public/boy?username=NA@NA.COM', 'others', 'user', 'RAZEL MAE', 'DETABLAN', 'NA', 'HRMO', 'HRMO III', 'Talisay');

SET FOREIGN_KEY_CHECKS = 1;
