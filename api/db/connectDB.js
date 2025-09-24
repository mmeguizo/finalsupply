import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, // Database Name
  process.env.MYSQL_USER, // Username
  process.env.MYSQL_PASSWORD, // Password
  {
    host: process.env.MYSQL_HOST, // MySQL Server Host
    dialect: "mysql", // Use MySQL as the database
    logging: false, // Set to true to enable SQL query logging
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected!");
  } catch (error) {
    console.error("❌ MySQL Connection Failed:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await sequelize.close();
    console.log("🔌 MySQL Disconnected");
  } catch (error) {
    console.error("❌ Error while disconnecting from MySQL:", error);
  }
};

export const syncTables = async () => {
  try {
    // Alter tables to match models (preserves data and adds missing columns)
    await sequelize.sync({ alter: true });
    // Force sync to rebuild tables (BE CAREFUL - this drops existing data)
    // await sequelize.sync({ force: true });
    console.log("✅ MySQL Tables Synced");
  } catch (error) {
    console.error("❌ Error while syncing tables:", error);
  }
}

