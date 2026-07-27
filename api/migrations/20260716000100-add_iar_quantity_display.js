import { DataTypes } from 'sequelize';

export const up = async (queryInterface, Sequelize) => {
  const tableName = 'inspection_acceptance_report';
  const cols = await queryInterface.describeTable(tableName);

  // Add iarQuantityDisplay field
  if (!cols['iar_quantity_display']) {
    await queryInterface.addColumn(tableName, 'iar_quantity_display', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Display text for IAR quantity column (e.g. percentage like 11.79%)',
    });
    console.log('Added column iar_quantity_display');
  } else {
    console.log('Skipping existing column iar_quantity_display');
  }
};

export const down = async (queryInterface, Sequelize) => {
  const tableName = 'inspection_acceptance_report';
  await queryInterface.removeColumn(tableName, 'iar_quantity_display');
  console.log('Removed column iar_quantity_display');
};

export default { up, down };
