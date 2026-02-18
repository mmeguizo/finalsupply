import { sequelize } from "../db/connectDB.js";

// Dynamic import for the CommonJS migration
const migration = await import("../migrations/20251215000100-add_ris_ics_signatory_fields.js");
const up = migration.default?.up || migration.up;

(async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = (await import("sequelize")).default;
    await up(queryInterface, Sequelize);
    console.log("[migration] add_ris_ics_signatory_fields: SUCCESS");
  } catch (err) {
    console.error("[migration] add_ris_ics_signatory_fields: FAILED", err);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch {}
  }
})();
