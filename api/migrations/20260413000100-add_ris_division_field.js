import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  const tableName = 'inspection_acceptance_report';
  const cols = await queryInterface.describeTable(tableName);

  if (!cols['risDivision']) {
    await queryInterface.addColumn(tableName, 'risDivision', {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    });
    console.log('Added column risDivision');
  } else {
    console.log('Skipping existing column risDivision');
  }
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('inspection_acceptance_report', 'risDivision');
}
