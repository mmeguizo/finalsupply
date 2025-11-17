import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // load env variables from .env

// 🧩 Tables to check for duplicate indexes
const TABLES = [
  "department",
  "inspection_acceptance_report",
  "purchase_order_items",
  "purchase_order_items_history",
  "purchase_orders",
  "roles",
  "sessions",
  "signatories",
  "users",
];

export const runCleanup = async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log("🧩 Checking selected tables for duplicate indexes...");

  for (const tableName of TABLES) {
    try {
      const [indexes] = await connection.query(`SHOW INDEXES FROM \`${tableName}\`;`);

      // Collect index names (excluding PRIMARY)
      const allIndexNames = indexes
        .map((i) => i.Key_name)
        .filter((key) => key !== "PRIMARY");

      // Find duplicates like name_2, name_3, title_4, etc.
      const duplicates = allIndexNames.filter((key) => key.match(/_\d+$/));

      if (duplicates.length > 0) {
        console.log(`⚠️ Found ${duplicates.length} duplicate indexes in '${tableName}'`);

        // Build one ALTER TABLE statement dropping all duplicates
        const dropSQL = duplicates.map((key) => `DROP INDEX \`${key}\``).join(", ");
        const sql = `ALTER TABLE \`${tableName}\` ${dropSQL};`;

        await connection.query(sql);
        console.log(`✅ Cleaned duplicates from '${tableName}'`);
      } else {
        console.log(`✅ No duplicate indexes in '${tableName}'`);
      }
    } catch (err) {
      console.error(`❌ Error checking table '${tableName}':`, err.message);
    }
  }

  await connection.end();
  console.log("🎉 Index cleanup complete!");
};

// Run directly if script is executed via `node scripts/cleanup-indexes.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  runCleanup().catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  });
}
