/**
 * Run migration to add record_type column to inspection_acceptance_report table.
 * Usage: node --experimental-modules api/scripts/run_record_type_migration.js
 */
import { sequelize } from '../db/connectDB.js';
import migration from '../migrations/20260416000100-add_record_type_to_inspection_acceptance_report.js';

async function run() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected. Running migration...');

    await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

run();
