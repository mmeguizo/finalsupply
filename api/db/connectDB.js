import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import os from "os";
import cluster from "cluster";

dotenv.config();

// Get CPU count for optimal pool sizing
const numCPUs = os.cpus().length;

// Calculate pool size per worker
const workerCount = parseInt(process.env.CLUSTER_INSTANCES) || Math.max(Math.floor(numCPUs / 2), 2);
const poolPerWorker = Math.max(Math.floor(((numCPUs * 2) + 1) / workerCount), 2);
const optimalPoolSize = Math.min(poolPerWorker, 20);

// ═══════════════════════════════════════════════════════════════
// SEQUELIZE INSTANCE - Named export for models
// ═══════════════════════════════════════════════════════════════
export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false,
    
    pool: {
      max: optimalPoolSize,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    
    // Retry on deadlock
    retry: {
      max: 3,
      match: [/Deadlock/i, /ER_LOCK_DEADLOCK/],
    },
  }
);

// Track if sync has been completed
let syncCompleted = false;

// ═══════════════════════════════════════════════════════════════
// CONNECT TO DATABASE
// ═══════════════════════════════════════════════════════════════
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    
    const workerId = cluster.isWorker ? cluster.worker.id : 'master';
    console.log(`✅ MySQL Connected! (Worker: ${workerId})`);
    console.log(`   Pool Size: ${optimalPoolSize} connections`);
    console.log(`   CPU Cores: ${numCPUs}`);
    
    return sequelize;
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
    throw err;
  }
};

// ═══════════════════════════════════════════════════════════════
// SYNC TABLES - Only runs on primary worker in cluster mode
// ═══════════════════════════════════════════════════════════════
export const syncTables = async () => {
  try {
    const isPrimaryWorker = !cluster.isWorker || cluster.worker.id === 1;
    const workerId = cluster.isWorker ? cluster.worker.id : 'master';
    
    if (syncCompleted) {
      console.log(`   ⏭️ Sync already completed, skipping (Worker: ${workerId})`);
      return;
    }
    
    if (isPrimaryWorker) {
      console.log(`   🔄 Syncing database tables (Worker: ${workerId})...`);
      
      // IMPORTANT: alter: false prevents deadlocks in cluster mode
      await sequelize.sync({ alter: false });
      
      console.log(`   ✅ Database sync completed`);
      syncCompleted = true;
    } else {
      console.log(`   ⏳ Worker ${workerId} waiting for primary to sync...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log(`   ✅ Worker ${workerId} ready`);
    }
  } catch (err) {
    console.error("❌ Error while syncing tables:", err);
    
    if (err.original?.code === 'ER_LOCK_DEADLOCK') {
      console.log("   ⚠️ Deadlock detected, retrying in 2 seconds...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        await sequelize.sync({ alter: false });
        console.log("   ✅ Sync retry successful");
        syncCompleted = true;
      } catch (retryErr) {
        console.error("❌ Sync retry failed:", retryErr.message);
      }
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// DISCONNECT FROM DATABASE
// ═══════════════════════════════════════════════════════════════
export const disconnectDB = async () => {
  try {
    await sequelize.close();
    console.log("👋 Database connection closed");
  } catch (err) {
    console.error("Error closing database:", err);
  }
};

export default sequelize;