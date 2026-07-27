import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'inspection_acceptance_report';
    const cols = await queryInterface.describeTable(tableName);

    // Add record_type column to distinguish original IAR records from issuance clones
    if (!cols['record_type']) {
      await queryInterface.addColumn(tableName, 'record_type', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'iar_original',
        comment:
          'Distinguishes original IAR records from issuance clones (iar_original | issuance_clone)',
      });
      console.log('Added column record_type');
    } else {
      console.log('Skipping existing column record_type');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'inspection_acceptance_report';
    await queryInterface.removeColumn(tableName, 'record_type');
    console.log('Removed column record_type');
  },
};
