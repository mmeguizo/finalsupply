import { DataTypes } from 'sequelize';

/**
 * Adds is_active column to roles table to align with other models and resolver expectations.
 */
export async function up(queryInterface) {
  // Only add if it doesn't exist (defensive): MySQL supports SHOW COLUMNS
  const [results] = await queryInterface.sequelize.query("SHOW COLUMNS FROM `roles` LIKE 'is_active'");
  if (results && results.Field === 'is_active') {
    return; // already exists
  }
  await queryInterface.addColumn('roles', 'is_active', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    after: 'description'
  });
}

export async function down(queryInterface) {
  const [results] = await queryInterface.sequelize.query("SHOW COLUMNS FROM `roles` LIKE 'is_active'");
  if (!results || results.Field !== 'is_active') {
    return; // nothing to drop
  }
  await queryInterface.removeColumn('roles', 'is_active');
}
