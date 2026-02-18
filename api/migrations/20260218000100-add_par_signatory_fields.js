import { DataTypes } from 'sequelize';

/**
 * Adds PAR signatory and department fields to inspection_acceptance_report table.
 * These fields allow storing per-item/per-ID signatories for PAR documents.
 */
export async function up(queryInterface) {
  const tableName = 'inspection_acceptance_report';

  // par_received_from - name of the person who issued/gave the item
  const [receivedFromCol] = await queryInterface.sequelize.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE 'par_received_from'`
  );
  if (!receivedFromCol?.length) {
    await queryInterface.addColumn(tableName, 'par_received_from', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'PAR signatory - Received From name',
    });
  }

  // par_received_from_position
  const [receivedFromPosCol] = await queryInterface.sequelize.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE 'par_received_from_position'`
  );
  if (!receivedFromPosCol?.length) {
    await queryInterface.addColumn(tableName, 'par_received_from_position', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'PAR signatory - Received From position/role',
    });
  }

  // par_received_by - name of the person receiving the item (end user)
  const [receivedByCol] = await queryInterface.sequelize.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE 'par_received_by'`
  );
  if (!receivedByCol?.length) {
    await queryInterface.addColumn(tableName, 'par_received_by', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'PAR signatory - Received By name',
    });
  }

  // par_received_by_position
  const [receivedByPosCol] = await queryInterface.sequelize.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE 'par_received_by_position'`
  );
  if (!receivedByPosCol?.length) {
    await queryInterface.addColumn(tableName, 'par_received_by_position', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'PAR signatory - Received By position',
    });
  }

  // par_department - department for this PAR assignment
  const [deptCol] = await queryInterface.sequelize.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE 'par_department'`
  );
  if (!deptCol?.length) {
    await queryInterface.addColumn(tableName, 'par_department', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Department assigned for this PAR item',
    });
  }

  // par_assigned_date - when the PAR ID was assigned
  const [assignedDateCol] = await queryInterface.sequelize.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE 'par_assigned_date'`
  );
  if (!assignedDateCol?.length) {
    await queryInterface.addColumn(tableName, 'par_assigned_date', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when PAR ID was assigned',
    });
  }
}

export async function down(queryInterface) {
  const tableName = 'inspection_acceptance_report';
  const columns = [
    'par_received_from',
    'par_received_from_position', 
    'par_received_by',
    'par_received_by_position',
    'par_department',
    'par_assigned_date'
  ];

  for (const col of columns) {
    const [exists] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE '${col}'`
    );
    if (exists?.length) {
      await queryInterface.removeColumn(tableName, col);
    }
  }
}
