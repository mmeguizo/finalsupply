-- List existing FKs on purchase_order_items
SELECT CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'purchase_order_items'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Drop the wrong FK (replace <constraint_name> with the result from the query above)
-- Example:
-- ALTER TABLE `purchase_order_items` DROP FOREIGN KEY `purchase_order_items_ibfk_1`;

-- Ensure column exists (it usually does)
-- ALTER TABLE `purchase_order_items` ADD COLUMN `purchase_order_id` INT NOT NULL;

-- Add the correct FK to purchase_orders(id)
ALTER TABLE `purchase_order_items`
  ADD CONSTRAINT `fk_poi_po`
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
