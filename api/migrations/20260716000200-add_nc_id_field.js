'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inspection_acceptance_report', 'nc_id', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: null,
      comment: 'No-category issuance ticket ID (e.g., NC-2026-04-0001)',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('inspection_acceptance_report', 'nc_id');
  },
};
