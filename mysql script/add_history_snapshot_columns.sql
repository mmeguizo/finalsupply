-- Snapshot columns for purchase_order_items_history
-- Run this on your database to align with the Sequelize model fields

ALTER TABLE `purchase_order_items_history`
  ADD COLUMN `purchase_order_id` INT NULL AFTER `id`,
  ADD COLUMN `item_name` VARCHAR(255) NULL DEFAULT '' AFTER `purchase_order_item_id`,
  ADD COLUMN `description` TEXT NULL AFTER `item_name`,
  ADD COLUMN `iar_id` VARCHAR(255) NULL AFTER `new_amount`,
  ADD COLUMN `par_id` VARCHAR(255) NULL AFTER `iar_id`,
  ADD COLUMN `ris_id` VARCHAR(255) NULL AFTER `par_id`,
  ADD COLUMN `ics_id` VARCHAR(255) NULL AFTER `ris_id`;
