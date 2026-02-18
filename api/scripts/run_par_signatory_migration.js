import { sequelize } from '../db/connectDB.js';
import { up } from '../migrations/20260218000100-add_par_signatory_fields.js';

async function runMigration() {
  try {
    console.log('Starting PAR signatory fields migration...');
    
    // Get the query interface from sequelize
    const queryInterface = sequelize.getQueryInterface();
    
    // Run the migration
    await up(queryInterface);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
