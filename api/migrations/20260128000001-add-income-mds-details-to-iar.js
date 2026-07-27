import { Sequelize } from 'sequelize';

export async function up(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    const tableDescription = await queryInterface.describeTable('inspection_acceptance_report');

    if (!tableDescription.income) {
      await queryInterface.addColumn(
        'inspection_acceptance_report',
        'income',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Income info specific to this IAR',
        },
        { transaction }
      );
      console.log('Added income column');
    }

    if (!tableDescription.mds) {
      await queryInterface.addColumn(
        'inspection_acceptance_report',
        'mds',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'MDS info specific to this IAR',
        },
        { transaction }
      );
      console.log('Added mds column');
    }

    if (!tableDescription.details) {
      await queryInterface.addColumn(
        'inspection_acceptance_report',
        'details',
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Details specific to this IAR',
        },
        { transaction }
      );
      console.log('Added details column');
    }

    await transaction.commit();
    console.log('Added income, mds, details columns to inspection_acceptance_report');
  } catch (error) {
    await transaction.rollback();
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function down(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.removeColumn('inspection_acceptance_report', 'income', { transaction });
    await queryInterface.removeColumn('inspection_acceptance_report', 'mds', { transaction });
    await queryInterface.removeColumn('inspection_acceptance_report', 'details', { transaction });
    await transaction.commit();
    console.log('Removed income, mds, details columns from inspection_acceptance_report');
  } catch (error) {
    await transaction.rollback();
    console.error('Rollback failed:', error);
    throw error;
  }
}
