import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

// Get CPU count for optimal pool sizing
const numCPUs = os.cpus().length;

// Calculate optimal pool size based on CPU cores
// Formula: (core_count * 2) + spindle_count (use 1 for SSD)
const optimalPoolSize = Math.min((numCPUs * 2) + 1, 50); // Cap at 50

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, // Database Name
  process.env.MYSQL_USER, // Username
  process.env.MYSQL_PASSWORD, // Password
  {
    host: process.env.MYSQL_HOST, // MySQL Server Host
    dialect: "mysql", // Use MySQL as the database
    logging: false, // Set to true to enable SQL query logging
    
    // ═══════════════════════════════════════════════════════════════
    // CONNECTION POOL - Optimized for 200+ concurrent users
    // ═══════════════════════════════════════════════════════════════
    pool: {
      max: optimalPoolSize,       // Max connections (based on CPU cores)
      min: Math.max(numCPUs, 5),  // Keep at least 5 connections warm
      acquire: 30000,             // Max time (ms) to acquire connection
      idle: 10000,                // Release idle connections after 10s
      evict: 1000,                // Check for idle connections every 1s
    },
    
    // ═══════════════════════════════════════════════════════════════
    // RETRY LOGIC - Handle connection drops gracefully
    // ═══════════════════════════════════════════════════════════════
    retry: {
      max: 3,                     // Retry failed queries up to 3 times
    },
    
    // ═══════════════════════════════════════════════════════════════
    // PERFORMANCE OPTIONS
    // ═══════════════════════════════════════════════════════════════
    dialectOptions: {
      connectTimeout: 10000,      // Connection timeout (10s)
      // For MySQL 8.0+ with SSL
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false
      // }
    },
    
    // Timezone configuration
    timezone: '+08:00', // Adjust to your timezone
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL Connected!`);
    console.log(`   Pool Size: ${sequelize.config.pool.max} connections`);
    console.log(`   CPU Cores: ${numCPUs}`);
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

