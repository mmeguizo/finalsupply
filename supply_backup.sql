/*
 Navicat Premium Data Transfer

 Source Server         : supply
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3306
 Source Schema         : supply

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 01/12/2025 08:46:01
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
INSERT INTO `department` VALUES (5, 'HRMO', '', 1, '2025-09-17 01:24:17', '2025-09-17 01:24:17');

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
  CONSTRAINT `inspection_acceptance_report_ibfk_125` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inspection_acceptance_report_ibfk_126` FOREIGN KEY (`purchase_order_item_id`) REFERENCES `purchase_order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 273 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inspection_acceptance_report
-- ----------------------------
INSERT INTO `inspection_acceptance_report` VALUES (250, '081925-001-TI', 98, '', 'laptop', 'pcs', 10, 100000.00, 1000000.00, 2, 'property acknowledgement reciept', '', 0, '2025-08-19 02:36:24', '2025-08-19 02:36:46', 210, '', '', '25-001', 'Mark Oliver', 'Mark Oliver', '1', 'complete');
INSERT INTO `inspection_acceptance_report` VALUES (251, '081925-002-TI', 99, '', 'TEST', 'TEST', 100, 1000.00, 100000.00, 100, 'inventory custodian slip', 'high', 0, '2025-08-19 03:19:47', '2025-09-17 01:12:06', 211, 'SPHV-2025-09-0011', '', '', 'Mark Oliver', 'Mark Oliver', 'TEST', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (252, '090825-003-TI', 100, '', 'router', 'pcs', 10, 20.00, 200.00, 1, 'requisition issue slip', '', 0, '2025-09-08 01:30:24', '2025-09-08 01:31:23', 212, '', '2025-09-0001', '', 'Mark Oliver', 'Mark Oliver', '1', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (253, '091725-004-TI', 100, '', 'router', 'pcs', 10, 20.00, 200.00, 8, 'requisition issue slip', '', 0, '2025-09-08 01:30:24', '2025-09-17 00:25:24', 212, '', '2025-09-0002', '', 'test', 'test', '1', 'none');
INSERT INTO `inspection_acceptance_report` VALUES (254, '091725-005-TI', 99, '', 'TEST', 'TEST', 100, 1000.00, 100000.00, 10, 'inventory custodian slip', 'high', 0, '2025-08-19 03:19:46', '2025-09-17 01:12:06', 211, 'SPHV-2025-09-0011', '', '', 'test', 'test', 'TEST', 'none');
INSERT INTO `inspection_acceptance_report` VALUES (255, '091725-006-TI', 101, '', 'ELECTRONIC BILL COUNTER', 'PCS', 2, 6500.00, 13000.00, 1, 'inventory custodian slip', 'high', 0, '2025-09-17 00:57:34', '2025-09-17 05:04:25', 213, 'SPHV-2025-09-0012', '', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (256, '091725-007-TI', 101, '', 'ELECTRONIC BILL COUNTER', 'PCS', 2, 6500.00, 13000.00, 1, 'inventory custodian slip', 'high', 0, '2025-09-17 00:57:34', '2025-09-17 05:04:25', 213, 'SPHV-2025-09-0012', '', '', 'test', 'test', '', 'complete');
INSERT INTO `inspection_acceptance_report` VALUES (257, '091725-008-TI', 99, '', 'TEST', 'TEST', 100, 1000.00, 100000.00, 10, 'inventory custodian slip', 'high', 0, '2025-08-19 03:19:46', '2025-09-17 01:12:06', 211, 'SPHV-2025-09-0011', '', '', 'test', 'test', 'TEST', 'none');
INSERT INTO `inspection_acceptance_report` VALUES (258, '091725-009-TI', 102, '', 'Clip', 'pc', 100, 1.50, 150.00, 50, 'requisition issue slip', '', 0, '2025-09-17 01:17:56', '2025-09-17 01:18:06', 215, '', '2025-09-0002', '', 'test', 'test', '12', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (259, '091725-009-TI', 102, '', 'Ballpen', 'box', 2, 250.00, 500.00, 1, 'requisition issue slip', '', 0, '2025-09-17 01:17:56', '2025-09-17 01:18:06', 216, '', '2025-09-0003', '', 'test', 'test', '15', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (260, '091725-009-TI', 102, '', 'Ballpen', 'box', 7, 250.00, 1750.00, 5, 'requisition issue slip', '', 0, '2025-09-17 01:07:32', '2025-09-17 01:18:06', 214, '', '2025-09-0004', '', 'test', 'test', '13', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (261, '091725-010-TI', 102, '', 'Ballpen', 'box', 7, 250.00, 1750.00, 2, 'requisition issue slip', '', 0, '2025-09-17 01:07:32', '2025-09-17 01:32:41', 214, '', '2025-09-0003', '', 'test', 'test', '13', 'complete');
INSERT INTO `inspection_acceptance_report` VALUES (262, '091725-010-TI', 102, '', 'Clip', 'pc', 100, 1.50, 150.00, 50, 'requisition issue slip', 'none', 0, '2025-09-17 01:17:56', '2025-09-17 01:32:41', 215, '', '2025-09-0003', '', 'test', 'test', '12', 'complete');
INSERT INTO `inspection_acceptance_report` VALUES (263, '091725-010-TI', 102, '', 'Ballpen', 'box', 2, 250.00, 500.00, 1, 'requisition issue slip', 'none', 0, '2025-09-17 01:17:56', '2025-09-17 01:32:41', 216, '', '2025-09-0004', '', 'test', 'test', '15', 'complete');
INSERT INTO `inspection_acceptance_report` VALUES (264, '100625-011-TI', 103, '', 'REGULATOR', 'set', 4, 300.00, 1200.00, 2, 'inventory custodian slip', 'low', 0, '2025-10-06 02:27:46', '2025-10-06 02:28:15', 217, 'SPLV-2025-10-0001T', '', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (265, '100625-011-TI', 103, '', 'GAS RANGE', 'PCS', 4, 1200.00, 4800.00, 3, 'inventory custodian slip', 'low', 0, '2025-10-06 02:27:46', '2025-10-06 02:28:15', 218, 'SPLV-2025-10-0001T', '', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (266, '100625-012-TI', 103, '', 'REGULATOR', 'set', 4, 300.00, 1200.00, 3, 'inventory custodian slip', 'low', 0, '2025-10-06 02:27:46', '2025-10-06 02:31:59', 217, 'SPLV-2025-10-0002T', '', '', 'test', 'test', '', 'complete');
INSERT INTO `inspection_acceptance_report` VALUES (267, '100625-012-TI', 103, '', 'GAS RANGE', 'PCS', 4, 1200.00, 4800.00, 2, 'inventory custodian slip', 'low', 0, '2025-10-06 02:27:46', '2025-10-06 02:31:59', 218, 'SPLV-2025-10-0002T', '', '', 'test', 'test', '', 'complete');
INSERT INTO `inspection_acceptance_report` VALUES (268, '100625-013-TI', 104, '', 'GAS RANGE', 'UNIT', 5, 2000.00, 10000.00, 5, 'inventory custodian slip', 'high', 0, '2025-10-06 03:10:02', '2025-10-06 03:10:10', 219, 'SPHV-2025-10-0013A', '', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (269, '100625-013-TI', 104, '', 'AIRCON', 'UNIT', 2, 50000.00, 100000.00, 2, 'property acknowledgement reciept', '', 0, '2025-10-06 03:10:02', '2025-10-06 03:10:10', 220, '', '', '25-002A', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (270, '100625-013-TI', 104, '', 'BALLPEN', 'pcs', 50, 5.00, 250.00, 2, 'requisition issue slip', '', 0, '2025-10-06 03:10:02', '2025-10-06 03:10:10', 221, '', '2025-10-0005A', '', 'test', 'test', '', 'partial');
INSERT INTO `inspection_acceptance_report` VALUES (271, '100625-014-TI', 104, '', 'BALLPEN', 'pcs', 50, 5.00, 250.00, 48, 'requisition issue slip', 'none', 0, '2025-10-06 03:10:02', '2025-10-06 03:16:28', 221, '', '2025-10-0006A', '', 'test', 'test', 'none', 'complete');
INSERT INTO `inspection_acceptance_report` VALUES (272, '110725-015-TI', 98, '', 'laptop', 'pcs', 10, 100000.00, 1000000.00, 2, 'property acknowledgement reciept', '', 0, '2025-08-19 02:36:24', '2025-11-12 09:02:04', 210, '', '', '25-003', 'Mark Oliver', 'Mark Oliver', '1', 'partial');

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
) ENGINE = InnoDB AUTO_INCREMENT = 222 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_order_items
-- ----------------------------
INSERT INTO `purchase_order_items` VALUES (210, 98, '', 'laptop', 'Lenovo Legion 5i (17-inch): \nProcessor: Intel Core i5-11400H or i7 (11th gen)\nGraphics: NVIDIA RTX 3060\nDisplay: 17.3-inch 1080p 144Hz\nRAM: 16GB dual-channel\nStorage: Multiple M.2 slots\nOther features: MUX switch, 720p webcam, backlit keyboard, Thunderbolt 4 ports', ' Intel Core i5\n-11400H \nor i7 (11th gen) \n', 'pcs', 10, 100000.00, 1000000.00, 4, 'property acknowledgement reciept', '2025-08-19 02:36:24', '2025-11-07 02:04:26', 0, '', NULL, '1');
INSERT INTO `purchase_order_items` VALUES (211, 99, '', 'TEST', 'TEST', 'TEST', 'TEST', 100, 1000.00, 100000.00, 120, 'inventory custodian slip', '2025-08-19 03:19:46', '2025-09-17 01:06:41', 0, 'high', NULL, 'TEST');
INSERT INTO `purchase_order_items` VALUES (212, 100, '', 'router', 'router with\nbluetooth\nconnections', '2.4ghz\nwifi\nbluetoot', 'pcs', 10, 20.00, 200.00, 9, 'requisition issue slip', '2025-09-08 01:30:24', '2025-09-17 00:25:23', 0, '', NULL, '1');
INSERT INTO `purchase_order_items` VALUES (213, 101, '', 'ELECTRONIC BILL COUNTER', '2087 UV/MG', 'with 2.8 or 3.5 TFT or LCD display, Automatic start, stop and count\nautomatic half note, chained note, double note deduction', 'PCS', 2, 6500.00, 13000.00, 2, 'inventory custodian slip', '2025-09-17 00:57:34', '2025-09-17 01:02:31', 0, 'high', NULL, '');
INSERT INTO `purchase_order_items` VALUES (214, 102, '', 'Ballpen', 'Fine Point, .5mm 50 pcs/box', 'Black', 'box', 7, 250.00, 1750.00, 7, 'requisition issue slip', '2025-09-17 01:07:32', '2025-09-17 01:32:28', 0, '', NULL, '13');
INSERT INTO `purchase_order_items` VALUES (215, 102, '', 'Clip', '19mm', 'backfold', 'pc', 100, 1.50, 150.00, 100, 'requisition issue slip', '2025-09-17 01:17:56', '2025-09-17 01:32:28', 0, 'none', NULL, '12');
INSERT INTO `purchase_order_items` VALUES (216, 102, '', 'Ballpen', 'Fine Point, .5mm 50 pcs/box', 'Blue', 'box', 2, 250.00, 500.00, 2, 'requisition issue slip', '2025-09-17 01:17:56', '2025-09-17 01:32:28', 0, 'none', NULL, '15');
INSERT INTO `purchase_order_items` VALUES (217, 103, '', 'REGULATOR', 'Intel Pressure', 'with Hose', 'set', 4, 300.00, 1200.00, 5, 'inventory custodian slip', '2025-10-06 02:27:46', '2025-10-06 02:31:47', 0, 'low', NULL, '');
INSERT INTO `purchase_order_items` VALUES (218, 103, '', 'GAS RANGE', '', 'Removable', 'PCS', 4, 1200.00, 4800.00, 5, 'inventory custodian slip', '2025-10-06 02:27:46', '2025-10-06 02:31:47', 0, 'low', NULL, '');
INSERT INTO `purchase_order_items` VALUES (219, 104, '', 'GAS RANGE', '', '', 'UNIT', 5, 2000.00, 10000.00, 5, 'inventory custodian slip', '2025-10-06 03:10:02', '2025-10-06 03:15:35', 0, 'high', NULL, 'none');
INSERT INTO `purchase_order_items` VALUES (220, 104, '', 'AIRCON', '', 'wall mounted', 'UNIT', 2, 50000.00, 100000.00, 2, 'property acknowledgement reciept', '2025-10-06 03:10:02', '2025-10-06 03:15:35', 0, 'none', NULL, 'none');
INSERT INTO `purchase_order_items` VALUES (221, 104, '', 'BALLPEN', '', 'black', 'pcs', 50, 5.00, 250.00, 50, 'requisition issue slip', '2025-10-06 03:10:02', '2025-10-06 03:15:35', 0, 'none', NULL, 'none');

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
) ENGINE = InnoDB AUTO_INCREMENT = 276 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_order_items_history
-- ----------------------------
INSERT INTO `purchase_order_items_history` VALUES (258, 210, 0, 10, 0, 2, 0.00, 1000000.00, 'quantity_update', 'Mark Oliver', 'Initial item creation with received quantity', '2025-08-19 02:36:24', '2025-08-19 02:36:24', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (259, 211, 0, 100, 0, 100, 0.00, 100000.00, 'quantity_update', 'Mark Oliver', 'Initial item creation with received quantity', '2025-08-19 03:19:47', '2025-08-19 03:19:47', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (260, 211, 100, 100, 100, 100, 100000.00, 100000.00, 'po_completed', 'Mark Oliver', 'Purchase Order Marked Complete', '2025-08-28 03:53:48', '2025-08-28 03:53:48', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (261, 212, 0, 10, 0, 1, 0.00, 200.00, 'quantity_update', 'Mark Oliver', 'Initial item creation with received quantity', '2025-09-08 01:30:24', '2025-09-08 01:30:24', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (262, 213, 2, 2, 2, 2, 13000.00, 13000.00, 'po_completed', 'test', 'Purchase Order Marked Complete', '2025-09-17 01:06:25', '2025-09-17 01:06:25', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (263, 215, 0, 100, 0, 50, 0.00, 150.00, 'item_creation', 'test', 'Initial item creation', '2025-09-17 01:17:56', '2025-09-17 01:17:56', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (264, 216, 0, 2, 0, 1, 0.00, 500.00, 'item_creation', 'test', 'Initial item creation', '2025-09-17 01:17:57', '2025-09-17 01:17:57', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (265, 214, 7, 7, 7, 7, 1750.00, 1750.00, 'po_completed', 'Mark Oliver', 'Purchase Order Marked Complete', '2025-09-22 03:05:29', '2025-09-22 03:05:29', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (266, 217, 4, 4, 0, 2, 1200.00, 1200.00, 'received_update', 'test', 'Received quantity update', '2025-10-06 02:28:07', '2025-10-06 02:28:07', 103, '', 'REGULATOR', '100625-011-TI', NULL, NULL, 'SPLV-2025-10-0001T');
INSERT INTO `purchase_order_items_history` VALUES (267, 218, 4, 4, 0, 3, 4800.00, 4800.00, 'received_update', 'test', 'Received quantity update', '2025-10-06 02:28:07', '2025-10-06 02:28:07', 103, '', 'GAS RANGE', '100625-011-TI', NULL, NULL, 'SPLV-2025-10-0001T');
INSERT INTO `purchase_order_items_history` VALUES (268, 217, 4, 4, 2, 5, 1200.00, 1200.00, 'received_update', 'test', 'Received quantity update', '2025-10-06 02:31:47', '2025-10-06 02:31:47', 103, '', 'REGULATOR', '100625-012-TI', NULL, NULL, 'SPLV-2025-10-0002T');
INSERT INTO `purchase_order_items_history` VALUES (269, 218, 4, 4, 3, 5, 4800.00, 4800.00, 'received_update', 'test', 'Received quantity update', '2025-10-06 02:31:47', '2025-10-06 02:31:47', 103, '', 'GAS RANGE', '100625-012-TI', NULL, NULL, 'SPLV-2025-10-0002T');
INSERT INTO `purchase_order_items_history` VALUES (270, 219, 0, 5, 0, 5, 0.00, 10000.00, 'item_creation', 'test', 'Initial item creation', '2025-10-06 03:10:02', '2025-10-06 03:10:02', 104, '', 'GAS RANGE', '100625-013-TI', NULL, NULL, 'SPHV-2025-10-0013A');
INSERT INTO `purchase_order_items_history` VALUES (271, 220, 0, 2, 0, 2, 0.00, 100000.00, 'item_creation', 'test', 'Initial item creation', '2025-10-06 03:10:02', '2025-10-06 03:10:02', 104, '', 'AIRCON', '100625-013-TI', '25-002A', NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (272, 221, 0, 50, 0, 2, 0.00, 250.00, 'item_creation', 'test', 'Initial item creation', '2025-10-06 03:10:02', '2025-10-06 03:10:02', 104, '', 'BALLPEN', '100625-013-TI', NULL, '2025-10-0005A', NULL);
INSERT INTO `purchase_order_items_history` VALUES (273, 221, 50, 50, 2, 50, 250.00, 250.00, 'received_update', 'test', 'Received quantity update', '2025-10-06 03:15:36', '2025-10-06 03:15:36', 104, '', 'BALLPEN', '100625-014-TI', NULL, '2025-10-0006A', NULL);
INSERT INTO `purchase_order_items_history` VALUES (274, 219, 5, 5, 5, 5, 10000.00, 10000.00, 'po_completed', 'Mark Oliver', 'Purchase Order Marked Complete', '2025-10-23 03:54:05', '2025-10-23 03:54:05', NULL, '', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_order_items_history` VALUES (275, 210, 10, 10, 2, 4, 1000000.00, 1000000.00, 'received_update', 'Mark Oliver', 'Received quantity update', '2025-11-07 02:04:26', '2025-11-07 02:04:26', 98, '', 'laptop', '110725-015-TI', '25-003', NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 105 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of purchase_orders
-- ----------------------------
INSERT INTO `purchase_orders` VALUES (98, '0607-234-25-B', 'direct contracting', 'PSMO', '2025-08-25', '2025-08-19', '2025-08-19', '6', 'more than 30 days', 1000000.00, 'pending', 0, '2025-08-19 02:36:24', '2025-11-19 09:26:39', 'JT & SONS', 'zone 1, talisay city, Negros Occidental, 6115, PH', NULL, '', NULL, NULL, '', NULL, '5000', 'mds', 'another details');
INSERT INTO `purchase_orders` VALUES (99, 'TEST', 'TEST', 'TEST', '2025-08-01', '2025-08-19', '2025-08-01', 'TEST', 'TEST', 100000.00, 'completed', 0, '2025-08-19 03:19:46', '2025-09-17 01:06:41', 'TEST', 'TEST', NULL, 'TEST', NULL, '2025-08-28', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_orders` VALUES (100, '0607-234-25-A', 'direct contracting', 'MIS-DPO', '2026-01-31', '2025-09-08', '2025-09-30', '123', 'more than 30 days', 200.00, 'pending', 0, '2025-09-08 01:30:24', '2025-09-17 00:25:23', 'JT & SONS xx', 'zone 1, talisay city, Negros Occidental, 6115, PH', NULL, '2222', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_orders` VALUES (101, '0805-379-25', 'NEGOTIATED PROCUREMENT ', 'CASHIER\'S OFFICE', '2025-08-26', '2025-09-17', '2025-09-17', '', '15', 13000.00, 'completed', 0, '2025-09-17 00:57:34', '2025-09-17 01:06:25', 'GBS TECHNOLOGIES OPC', 'HILADO ST. CAPITOL SHOPPING CENTER, VILLAMONTE, BACOLOD CITY', NULL, '', NULL, '2025-09-17', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_orders` VALUES (102, '0806-386-25', 'SHOPPING - ORDINARY', 'EXECUTIVE, CASHIER\'S, ETC.', '2025-08-27', '2025-09-17', '2025-08-12', '15', '30', 2400.00, 'completed', 0, '2025-09-17 01:07:32', '2025-09-22 03:05:29', 'HARDY MARKETING ENTERPRISES', 'BACOLOD CITY', NULL, '', NULL, '2025-09-22', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `purchase_orders` VALUES (103, '0828-441-25', 'NEGOTIATED PROCUREMENT ', 'COLLEGE OF EDUCATION', '2025-09-20', '2025-10-06', '2025-09-05', '15', '30', 6000.00, 'pending', 0, '2025-10-06 02:27:46', '2025-10-06 02:31:47', 'PRYCE GASES, INC', 'Talisay City', NULL, '', NULL, NULL, 'Talisay', NULL, NULL, NULL, NULL);
INSERT INTO `purchase_orders` VALUES (104, '0807-222-25', 'NEGOTIATED PROCUREMENT ', 'psmo', '2025-11-05', '2025-10-06', '2025-10-06', '30', '30', 110250.00, 'completed', 0, '2025-10-06 03:02:56', '2025-10-23 03:54:05', 'HARDY MARKETING ENTERPRISES', 'BACOLOD CITY', NULL, '', NULL, '2025-10-23', 'Alijis', NULL, NULL, NULL, NULL);

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
INSERT INTO `sessions` VALUES ('sizDibTtz8HdhWBDcJfAquH9oTVhdQOc', 1765154152, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2025-12-08T00:35:29.428Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"passport\":{\"user\":1}}');

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
INSERT INTO `signatories` VALUES (8, 'MA. KRISTINA MEDALLA', 'Reciever', 101, 0, '2025-09-17 01:00:03', '2025-09-17 01:00:03', NULL);
INSERT INTO `signatories` VALUES (9, 'MA. KRISTINA MEDALLA', 'Reciever', 102, 0, '2025-09-17 01:22:32', '2025-09-17 01:22:32', NULL);
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
