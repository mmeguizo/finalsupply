/**
 * Run migration to add nc_id column to inspection_acceptance_report table.
 * Usage: node --experimental-modules api/scripts/run_nc_id_migration.js
 */
import { sequelize } from '../db/connectDB.js';
import migration from '../migrations/20260716000200-add_nc_id_field.js';

async function run() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected. Running migration...');

    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('Migration completed successfully.');
  } catch (error) {
    if (error.original?.code === 'ER_DUP_FIELDNAME') {
      console.log('Column nc_id already exists. Skipping.');
    } else {
      console.error('Migration failed:', error);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

run();
