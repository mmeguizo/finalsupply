/**
 * PM2 Ecosystem Configuration - Full Stack
 * Runs both Backend API and Frontend together
 * 
 * OPTIMIZED FOR 200+ CONCURRENT USERS
 * 
 * Commands:
 *   pm2 start ecosystem.config.cjs                    # Start all
 *   pm2 start ecosystem.config.cjs --only SUPPLY-API  # Start only API
 *   pm2 start ecosystem.config.cjs --env production   # Production mode
 *   pm2 monit                                         # Monitor all processes
 *   pm2 logs                                          # View all logs
 *   pm2 reload all                                    # Zero-downtime reload
 *   pm2 scale SUPPLY-API +2                           # Add 2 more instances
 */

const os = require('os');

// Get system info
const numCPUs = os.cpus().length;
const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024)); // GB

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  PM2 Cluster Configuration                                         ║
║  CPU Cores: ${String(numCPUs).padEnd(3)} | Total RAM: ${String(totalMemory).padEnd(2)} GB                              ║
║  API Instances: ${String(numCPUs).padEnd(3)} (one per core)                              ║
╚════════════════════════════════════════════════════════════════════╝
`);

module.exports = {
  apps: [
    // ═══════════════════════════════════════════════════════════════════
    // BACKEND API - CLUSTER MODE (Multiple Instances)
    // ═══════════════════════════════════════════════════════════════════
    {
      name: "SUPPLY-API",
      script: "index.js",
      cwd: "./api",  // Relative path - adjust as needed
      
      // CLUSTER MODE - This is the key for handling 200+ users
      instances: numCPUs,           // Use ALL CPU cores
      exec_mode: "cluster",         // Load balance across instances
      
      // Alternatively, use "max" to auto-detect:
      // instances: "max",
      
      // Memory Management
      max_memory_restart: "1G",     // Restart if > 1GB RAM
      autorestart: true,
      watch: false,                 // IMPORTANT: Disable in production
      max_restarts: 10,
      restart_delay: 4000,
      
      // Environment
      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      
      // Logging
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      time: true,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // Performance
      node_args: [
        "--max-old-space-size=2048",  // 2GB heap per instance
      ],
      
      // Graceful shutdown for zero-downtime deploys
      kill_timeout: 5000,
      listen_timeout: 10000,
      wait_ready: true,
    },

    // ═══════════════════════════════════════════════════════════════════
    // FRONTEND - DEVELOPMENT SERVER (Single Instance)
    // For production: Build and serve with Nginx instead
    // ═══════════════════════════════════════════════════════════════════
    {
      name: "SUPPLY-FRONTEND",
      script: "npm",
      args: "run dev",
      cwd: "./app",  // Relative path - adjust as needed
      
      // Single instance for dev server
      instances: 1,
      exec_mode: "fork",
      
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      time: true,
      merge_logs: true,
    }
  ],

  // ═══════════════════════════════════════════════════════════════════
  // DEPLOY CONFIGURATION (Optional - for remote deployment)
  // ═══════════════════════════════════════════════════════════════════
  deploy: {
    production: {
      user: "deploy",
      host: ["your-server.com"],
      ref: "origin/main",
      repo: "git@github.com:mmeguizo/finalsupply.git",
      path: "/var/www/supply",
      "pre-deploy-local": "",
      "post-deploy": "npm install && pm2 reload ecosystem.config.cjs --env production",
      "pre-setup": "",
    }
  }
};
