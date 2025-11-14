import { DataTypes } from 'sequelize';

/**
 * Adds income, mds, and details columns to purchase_orders table and provides down migration.
 */
export async function up(queryInterface) {
  // income
  const [incomeCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_orders` LIKE 'income'"
  );
  if (!incomeCol || incomeCol.Field !== 'income') {
    await queryInterface.addColumn('purchase_orders', 'income', {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Income source or code',
      after: 'fundsource',
    });
  }

  // mds
  const [mdsCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_orders` LIKE 'mds'"
  );
  if (!mdsCol || mdsCol.Field !== 'mds') {
    await queryInterface.addColumn('purchase_orders', 'mds', {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'MDS reference',
      after: 'income',
    });
  }

  // details
  const [detailsCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_orders` LIKE 'details'"
  );
  if (!detailsCol || detailsCol.Field !== 'details') {
    await queryInterface.addColumn('purchase_orders', 'details', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional PO details',
      after: 'mds',
    });
  }
}

export async function down(queryInterface) {
  // remove details
  const [detailsCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_orders` LIKE 'details'"
  );
  if (detailsCol && detailsCol.Field === 'details') {
    await queryInterface.removeColumn('purchase_orders', 'details');
  }

  // remove mds
  const [mdsCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_orders` LIKE 'mds'"
  );
  if (mdsCol && mdsCol.Field === 'mds') {
    await queryInterface.removeColumn('purchase_orders', 'mds');
  }

  // remove income
  const [incomeCol] = await queryInterface.sequelize.query(
    "SHOW COLUMNS FROM `purchase_orders` LIKE 'income'"
  );
  if (incomeCol && incomeCol.Field === 'income') {
    await queryInterface.removeColumn('purchase_orders', 'income');
  }
}
