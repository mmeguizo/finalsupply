import { DataTypes } from 'sequelize';

/**
 * Adds campus column to purchase_orders table and provides down migration.
 */
export async function up(queryInterface) {
  // Add column only if it doesn't already exist
  const [rows] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_orders` LIKE 'campus'"
  );
  if (rows && rows.Field === 'campus') {
    return; // already exists
  }
  await queryInterface.addColumn('purchase_orders', 'campus', {
    type: DataTypes.STRING(50),
    allowNull: true,
    after: 'telephone',
    comment: 'Campus name: Talisay | Alijis | Binalbagan | Fortune Town',
  });
}

export async function down(queryInterface) {
  const [rows] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_orders` LIKE 'campus'"
  );
  if (!rows || rows.Field !== 'campus') {
    return; // nothing to drop
  }
  await queryInterface.removeColumn('purchase_orders', 'campus');
}
