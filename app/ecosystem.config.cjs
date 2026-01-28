const path = require('path');

module.exports = {
  apps: [
    {
      name: "SUPPLY-FRONTEND",
      script: "cmd.exe",
      args: "/c npm run dev",
      cwd: path.resolve(__dirname),  // Ensure correct directory
      
      instances: 1,
      exec_mode: "fork",
      
      env: {
        NODE_ENV: "development"
      },
      
      // Logging
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      merge_logs: true,
      
      // Stability
      max_memory_restart: "2G",
      autorestart: true,
      max_restarts: 5,
      restart_delay: 3000,
      kill_timeout: 10000,
    }
  ]
};

// module.exports = {
//   apps: [
//     {
//       name: "SUPPLY FRONTEND",
//       script: "cmd.exe",
//       args: "/c npm run dev",
//       cwd: "C:/Users/Mark Oliver/Desktop/SUPPLY WEB APP/app",
//       env: {
//         NODE_ENV: "development"
//       }
//     }
//   ]
// }
