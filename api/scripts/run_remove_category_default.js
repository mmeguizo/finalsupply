import { sequelize } from "../db/connectDB.js";
import { up } from "../migrations/20260610000100-remove-category-default-from-purchase-order-items.js";

(async () => {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await up(queryInterface);
    console.log("[migration] remove-category-default: SUCCESS");
  } catch (err) {
    console.error("[migration] remove-category-default: FAILED", err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
})();
