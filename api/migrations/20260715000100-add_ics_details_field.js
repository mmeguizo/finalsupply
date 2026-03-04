import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'inspection_acceptance_report';
    const cols = await queryInterface.describeTable(tableName);

    // Add icsDetails field
    if (!cols['ics_details']) {
      await queryInterface.addColumn(tableName, 'ics_details', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'ICS-specific details (separate from IAR details)',
      });
      console.log('Added column ics_details');
    } else {
      console.log('Skipping existing column ics_details');
    }

    // Add parDetails field
    if (!cols['par_details']) {
      await queryInterface.addColumn(tableName, 'par_details', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'PAR-specific details (separate from IAR details)',
      });
      console.log('Added column par_details');
    } else {
      console.log('Skipping existing column par_details');
    }

    // Add risDetails field
    if (!cols['ris_details']) {
      await queryInterface.addColumn(tableName, 'ris_details', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'RIS-specific details (separate from IAR details)',
      });
      console.log('Added column ris_details');
    } else {
      console.log('Skipping existing column ris_details');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'inspection_acceptance_report';
    await queryInterface.removeColumn(tableName, 'ics_details');
    await queryInterface.removeColumn(tableName, 'par_details');
    await queryInterface.removeColumn(tableName, 'ris_details');
    console.log('Removed columns ics_details, par_details, ris_details');
  },
};
