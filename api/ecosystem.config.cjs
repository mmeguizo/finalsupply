module.exports = {
  apps: [
    {
      name: "SUPPLY BACKEND",
      script: "cmd.exe",
      args: "/c npm run dev",
      cwd: "C:/Users/Mark Oliver/Desktop/SUPPLY WEB APP/api",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
}
