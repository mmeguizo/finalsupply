import { sequelize } from '../db/connectDB.js';
import { up as addIncomeMdsDetailsUp } from '../migrations/20251202001000-add_item_group_to_purchase_order_items.js';

(async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await addIncomeMdsDetailsUp(queryInterface);
    console.log('[migration] add_income_mds_details_to_purchase_orders: SUCCESS');
  } catch (err) {
    console.error('[migration] add_income_mds_details_to_purchase_orders: FAILED', err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
})();
