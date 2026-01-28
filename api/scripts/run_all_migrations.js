import { sequelize } from "../db/connectDB.js";
import { up as addCampusUp } from "../migrations/20250929000100-add_campus_to_purchase_orders.js";
import { up as addIncomeMdsDetailsUp } from "../migrations/20251113000100-add_income_mds_details_to_purchase_orders.js";
import { up as addItemGroupUp } from "../migrations/20251202001000-add_item_group_to_purchase_order_items.js";
import { up as addIarIncomeMdsDetailsUp } from "../migrations/20260128000001-add_income_mds_details_to_iar.js";

(async () => {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await addCampusUp(queryInterface);
    console.log("[migration] add_campus_to_purchase_orders: SUCCESS");

    await addIncomeMdsDetailsUp(queryInterface);
    console.log("[migration] add_income_mds_details_to_purchase_orders: SUCCESS");

    await addItemGroupUp(queryInterface);
    console.log("[migration] add_item_group_to_purchase_order_items: SUCCESS");

    await addIarIncomeMdsDetailsUp(queryInterface);
    console.log("[migration] add_income_mds_details_to_iar: SUCCESS");
  } catch (err) {
    console.error("[migration] FAILED", err);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch {}
  }
})();
