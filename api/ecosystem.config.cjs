const os = require('os');
const numCPUs = os.cpus().length;

// Use 2 instances for development, more for production
const instances = process.env.NODE_ENV === 'production' 
  ? Math.max(Math.floor(numCPUs / 2), 2)
  : 2;

module.exports = {
  apps: [
    {
      name: "SUPPLY-API",
      script: "./index.js",
      cwd: __dirname,
      instances: instances,
      exec_mode: "cluster",
      
      env: {
        NODE_ENV: "development",
        PORT: 4000,
        CLUSTER_INSTANCES: instances,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
        CLUSTER_INSTANCES: instances,
      },
      
      // Stagger startup to prevent deadlocks
      wait_ready: false,
      restart_delay: 3000,
      
      // Logging
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      merge_logs: true,
      
      // Stability
      max_memory_restart: "500M",
      autorestart: true,
      max_restarts: 10,
      kill_timeout: 5000,
    }
  ]
};