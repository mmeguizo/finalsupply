import { Sequelize } from 'sequelize';

export async function up(queryInterface) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    // Check if columns already exist before adding them
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
      console.log('✅ Added income column');
    } else {
      console.log('ℹ️ income column already exists');
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
      console.log('✅ Added mds column');
    } else {
      console.log('ℹ️ mds column already exists');
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
      console.log('✅ Added details column');
    } else {
      console.log('ℹ️ details column already exists');
    }

    await transaction.commit();
    console.log('✅ Migration completed: Added income, mds, details columns to inspection_acceptance_report');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration failed:', error);
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
    console.log('✅ Rollback completed: Removed income, mds, details columns from inspection_acceptance_report');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}
