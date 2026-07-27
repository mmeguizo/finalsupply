import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.createTable('id_counters', {
    type: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      comment: 'Document type: iar, par, ris, ics_high, ics_low',
    },
    year: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      comment: 'Fiscal/calendar year the sequence belongs to',
    },
    scope: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
      defaultValue: '',
      comment: 'Campus code for IAR; empty string for global counters',
    },
    counter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Last allocated sequence number',
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('id_counters');
}
