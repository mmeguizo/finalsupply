import { sequelize } from '../db/connectDB.js';
import { up } from '../migrations/20260413000100-add_ris_division_field.js';

(async () => {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await up(queryInterface);
    console.log('[migration] add_ris_division_field: SUCCESS');
  } catch (err) {
    console.error('[migration] FAILED', err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
})();
