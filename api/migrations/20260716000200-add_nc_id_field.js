export async function up(queryInterface, Sequelize) {
  const cols = await queryInterface.describeTable('inspection_acceptance_report');
  if (!cols.nc_id) {
    await queryInterface.addColumn('inspection_acceptance_report', 'nc_id', {
      type: Sequelize.STRING(20),
      allowNull: true,
      defaultValue: null,
      comment: 'No-category issuance ticket ID (e.g., NC-2026-04-0001)',
    });
  }
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('inspection_acceptance_report', 'nc_id');
}
