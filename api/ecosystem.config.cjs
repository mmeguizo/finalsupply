/**
 * PM2 Ecosystem Configuration - Backend API
 * Optimized for high concurrency (200+ users)
 * 
 * Run: pm2 start ecosystem.config.js
 * Monitor: pm2 monit
 * Logs: pm2 logs
 */

const os = require('os');

// Get the number of CPU cores
const numCPUs = os.cpus().length;

module.exports = {
  apps: [
    {
      name: "SUPPLY-API",
      script: "index.js",  // Direct script, not cmd.exe for cluster mode
      cwd: "C:/Users/Mark Oliver/Desktop/SUPPLY WEB APP/api",
      
      // ═══════════════════════════════════════════════════════════════
      // CLUSTER MODE - Use all CPU cores for max performance
      // ═══════════════════════════════════════════════════════════════
      instances: numCPUs,        // Use all available CPU cores (or set to "max")
      exec_mode: "cluster",      // Enable cluster mode for load balancing
      
      // ═══════════════════════════════════════════════════════════════
      // MEMORY & RESTART SETTINGS
      // ═══════════════════════════════════════════════════════════════
      max_memory_restart: "1G",  // Restart if memory exceeds 1GB
      autorestart: true,         // Auto restart on crash
      watch: false,              // Disable watch in production
      max_restarts: 10,          // Max restarts before stopping
      restart_delay: 4000,       // Wait 4s between restarts
      
      // ═══════════════════════════════════════════════════════════════
      // ENVIRONMENT VARIABLES
      // ═══════════════════════════════════════════════════════════════
      env: {
        NODE_ENV: "development",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      env_staging: {
        NODE_ENV: "staging",
        PORT: 4000,
      },
      
      // ═══════════════════════════════════════════════════════════════
      // LOGGING
      // ═══════════════════════════════════════════════════════════════
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      log_file: "./logs/api-combined.log",
      time: true,                // Add timestamps to logs
      merge_logs: true,          // Merge logs from all instances
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // ═══════════════════════════════════════════════════════════════
      // PERFORMANCE OPTIMIZATION
      // ═══════════════════════════════════════════════════════════════
      node_args: [
        "--max-old-space-size=2048",  // Increase heap size to 2GB
        "--optimize-for-size",         // Optimize for memory
      ],
      
      // ═══════════════════════════════════════════════════════════════
      // GRACEFUL SHUTDOWN
      // ═══════════════════════════════════════════════════════════════
      kill_timeout: 5000,        // Wait 5s for graceful shutdown
      listen_timeout: 10000,     // Wait 10s for app to listen
      wait_ready: true,          // Wait for process.send('ready')
    }
  ]
};
