import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  const cols = await queryInterface.describeTable('roles');
  if (cols.is_active) {
    return;
  }
  await queryInterface.addColumn('roles', 'is_active', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });
}

export async function down(queryInterface) {
  const cols = await queryInterface.describeTable('roles');
  if (!cols.is_active) {
    return;
  }
  await queryInterface.removeColumn('roles', 'is_active');
}
