import { sequelize } from "../db/connectDB.js";
import { up as addCampusUp } from "../migrations/20250929000100-add_campus_to_purchase_orders.js";

(async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await addCampusUp(queryInterface);
    console.log("[migration] add_campus_to_purchase_orders: SUCCESS");
  } catch (err) {
    console.error("[migration] add_campus_to_purchase_orders: FAILED", err);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch {}
  }
})();
