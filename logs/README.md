# PM2 Log Files
This folder contains PM2 application logs.

- `api-error.log` - API error logs
- `api-out.log` - API output logs
- `frontend-error.log` - Frontend error logs
- `frontend-out.log` - Frontend output logs

## View Logs
```bash
# View all logs in real-time
pm2 logs

# View specific app logs
pm2 logs SUPPLY-API
pm2 logs SUPPLY-FRONTEND

# View last 100 lines
pm2 logs --lines 100

# Clear all logs
pm2 flush
```
