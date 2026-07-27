import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'inspection_acceptance_report';
    const cols = await queryInterface.describeTable(tableName);

    if (!cols['po_remarks']) {
      await queryInterface.addColumn(tableName, 'po_remarks', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'PO Remarks for propagation to PAR/ICS/RIS print templates',
      });
      console.log('Added column po_remarks');
    } else {
      console.log('Skipping existing column po_remarks');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'inspection_acceptance_report';
    await queryInterface.removeColumn(tableName, 'po_remarks');
    console.log('Removed column po_remarks');
  },
};
