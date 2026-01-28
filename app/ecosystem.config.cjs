/**
 * PM2 Ecosystem Configuration - Frontend (Vite Dev/Build)
 * 
 * Note: For production, serve the built static files with Nginx or similar
 * For development, this runs the Vite dev server
 * 
 * Run: pm2 start ecosystem.config.js
 */

const os = require('os');
const numCPUs = os.cpus().length;

module.exports = {
  apps: [
    {
      name: "SUPPLY-FRONTEND",
      script: "npm",
      args: "run dev",           // For dev server
      // args: "run preview",    // For production preview after build
      cwd: "C:/Users/Mark Oliver/Desktop/SUPPLY WEB APP/app",
      
      // ═══════════════════════════════════════════════════════════════
      // SINGLE INSTANCE FOR DEV SERVER
      // Note: Vite dev server doesn't need cluster mode
      // For production, use Nginx to serve static build files
      // ═══════════════════════════════════════════════════════════════
      instances: 1,
      exec_mode: "fork",
      
      // ═══════════════════════════════════════════════════════════════
      // MEMORY & RESTART SETTINGS
      // ═══════════════════════════════════════════════════════════════
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 4000,
      
      // ═══════════════════════════════════════════════════════════════
      // ENVIRONMENT VARIABLES
      // ═══════════════════════════════════════════════════════════════
      env: {
        NODE_ENV: "development",
        PORT: 5173,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4173,
      },
      
      // ═══════════════════════════════════════════════════════════════
      // LOGGING
      // ═══════════════════════════════════════════════════════════════
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      log_file: "./logs/frontend-combined.log",
      time: true,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      
      // ═══════════════════════════════════════════════════════════════
      // GRACEFUL SHUTDOWN
      // ═══════════════════════════════════════════════════════════════
      kill_timeout: 5000,
      listen_timeout: 10000,
    }
  ]
};
