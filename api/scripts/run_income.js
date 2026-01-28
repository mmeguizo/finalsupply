import { sequelize } from "../db/connectDB.js";
import { up as addIarIncomeMdsDetailsUp } from "../migrations/add_income.js";

(async () => {
  const queryInterface = sequelize.getQueryInterface();
  try {
    console.log("🚀 Running migration: add_income_mds_details_to_iar...\n");
    await addIarIncomeMdsDetailsUp(queryInterface);
    console.log("\n[migration] add_income_mds_details_to_iar: SUCCESS");
  } catch (err) {
    console.error("[migration] FAILED", err);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch {}
  }
})();
