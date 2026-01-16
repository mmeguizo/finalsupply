import { DataTypes } from 'sequelize';

/**
 * Adds item_group_id and is_receipt_line columns to purchase_order_items
 * and backfills a stable group key for existing rows.
 */
export async function up(queryInterface) {
  // item_group_id
  const [grpCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_order_items` LIKE 'item_group_id'"
  );
  const grpExists = Array.isArray(grpCol) ? grpCol.length > 0 : !!grpCol;
  if (!grpExists) {
    await queryInterface.addColumn('purchase_order_items', 'item_group_id', {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Stable grouping key for logical item across updates/receipts',
      after: 'iar_id',
    });
    // Backfill: make each row its own group if null
    await queryInterface.sequelize.query(
      "UPDATE `purchase_order_items` SET `item_group_id` = CONCAT('poi-', id) WHERE `item_group_id` IS NULL"
    );
    // Add index for grouping queries
    await queryInterface.addIndex('purchase_order_items', ['item_group_id'], {
      name: 'idx_purchase_order_items_item_group_id',
    });
  }

  // is_receipt_line (for legacy cloned lines, optional usage)
  const [recFlagCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_order_items` LIKE 'is_receipt_line'"
  );
  const recFlagExists = Array.isArray(recFlagCol) ? recFlagCol.length > 0 : !!recFlagCol;
  if (!recFlagExists) {
    await queryInterface.addColumn('purchase_order_items', 'is_receipt_line', {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
      comment: 'Optional marker for cloned receipt-only lines',
      after: 'item_group_id',
    });
    await queryInterface.addIndex('purchase_order_items', ['is_receipt_line'], {
      name: 'idx_purchase_order_items_is_receipt_line',
    });
  }
}

export async function down(queryInterface) {
  // drop indexes then columns (defensive)
  try {
    await queryInterface.removeIndex('purchase_order_items', 'idx_purchase_order_items_item_group_id');
  } catch {}
  try {
    await queryInterface.removeIndex('purchase_order_items', 'idx_purchase_order_items_is_receipt_line');
  } catch {}

  const [grpCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_order_items` LIKE 'item_group_id'"
  );
  const grpExistsDown = Array.isArray(grpCol) ? grpCol.length > 0 : !!grpCol;
  if (grpExistsDown) {
    await queryInterface.removeColumn('purchase_order_items', 'item_group_id');
  }

  const [recFlagCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_order_items` LIKE 'is_receipt_line'"
  );
  const recFlagExistsDown = Array.isArray(recFlagCol) ? recFlagCol.length > 0 : !!recFlagCol;
  if (recFlagExistsDown) {
    await queryInterface.removeColumn('purchase_order_items', 'is_receipt_line');
  }
}
