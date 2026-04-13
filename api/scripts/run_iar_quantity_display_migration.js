import { sequelize } from '../db/connectDB.js';
import { up } from '../migrations/20260716000100-add_iar_quantity_display.js';

(async () => {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await up(queryInterface);
    console.log('[migration] add_iar_quantity_display: SUCCESS');
  } catch (err) {
    console.error('[migration] add_iar_quantity_display: FAILED', err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
})();
