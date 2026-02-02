# 🧪 Stress Test Suite

This folder contains comprehensive stress tests for the Supply Management System.

## Quick Start

```bash
# Navigate to stress-test folder
cd stress-test

# Install dependencies (shares with main api)
npm install

# Make sure your API server is running first!
cd ../api && npm run dev

# In another terminal, run the tests
cd ../stress-test

# Run all tests
npm run test:all

# Or run individual tests
npm run test:injection   # Security tests
npm run test:flow        # Full flow performance tests
npm run test:db          # Database stress tests
```

## 📁 Test Files

### 1. **injection-test.js** - Security Testing
Tests your API against common attack vectors:
- ✅ SQL Injection (30+ payloads)
- ✅ XSS (Cross-Site Scripting)
- ✅ NoSQL Injection
- ✅ Error-based injection detection

```bash
node injection-test.js
```

### 2. **full-flow-test.js** - Performance Testing
Tests the complete application flow:
- 🔐 Authentication (login/signup)
- 📊 Query operations (read performance)
- ✏️ Mutation operations (create/update)
- 🔥 Concurrent load testing

```bash
node full-flow-test.js
```

### 3. **db-stress-test.js** - Database Testing
Tests MySQL/Sequelize performance:
- 🔌 Connection pool handling
- 📊 Concurrent query performance
- 💾 Transaction stress testing
- 🐌 Slow query detection

```bash
node db-stress-test.js
```

## ⚙️ Configuration

Edit `config.js` to adjust test settings:

```javascript
export const CONFIG = {
  API_URL: 'http://localhost:4000',  // Your API URL
  
  STRESS: {
    TOTAL_REQUESTS: 100,      // Total requests to make
    CONCURRENT_USERS: 10,     // Simultaneous connections
  },
  
  THRESHOLDS: {
    MAX_RESPONSE_TIME_P95: 2000,  // Max acceptable P95 (ms)
    MAX_ERROR_RATE: 5,            // Max error rate (%)
  }
};
```

## 📊 Understanding Results

### Response Time Metrics
| Metric | Meaning |
|--------|---------|
| **Min** | Fastest response time |
| **Max** | Slowest response time |
| **Avg** | Average response time |
| **P50** | Median (50% of requests are faster) |
| **P95** | 95th percentile (only 5% are slower) |
| **P99** | 99th percentile (only 1% are slower) |

### Performance Rating
| Rating | P95 Response | Error Rate |
|--------|-------------|------------|
| ⭐⭐⭐⭐⭐ EXCELLENT | < 500ms | < 1% |
| ⭐⭐⭐⭐ GOOD | < 1000ms | < 5% |
| ⭐⭐⭐ FAIR | < 2000ms | < 10% |
| ⭐⭐ NEEDS WORK | < 5000ms | < 20% |
| ⭐ POOR | > 5000ms | > 20% |

## 🔒 Security Notes

The injection tests verify that your application is protected against common attacks. Sequelize provides built-in protection through parameterized queries:

```javascript
// ✅ SAFE - Sequelize parameterizes this
User.findOne({ where: { email: userInput } });

// ❌ UNSAFE - Raw query without parameters
sequelize.query(`SELECT * FROM users WHERE email = '${userInput}'`);

// ✅ SAFE - Raw query with parameters
sequelize.query('SELECT * FROM users WHERE email = ?', {
  replacements: [userInput]
});
```

## 🚀 Tips for Better Performance

### 1. Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_poi_purchase_order ON purchase_order_items(purchaseOrderId);
CREATE INDEX idx_po_created ON purchase_orders(createdAt);
```

### 2. Connection Pool Settings
```javascript
// In connectDB.js
const sequelize = new Sequelize({
  // ...
  pool: {
    max: 20,        // Increase for high traffic
    min: 5,         // Keep some connections warm
    acquire: 30000, // Max wait time for connection
    idle: 10000     // Release idle connections after 10s
  }
});
```

### 3. Add Rate Limiting
```javascript
// In api/index.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
});

app.use(limiter);
```

### 4. Implement Caching
```javascript
// Consider Redis for frequently accessed data
import Redis from 'ioredis';
const redis = new Redis();

// Cache purchase orders list
const cacheKey = 'purchaseOrders:list';
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
// ... fetch from DB and cache
```

## 📝 Sample Output

```
╔════════════════════════════════════════════════════════════════════╗
║         FULL FLOW STRESS TEST SUITE                                 ║
║         Target: http://localhost:4000                               ║
╚════════════════════════════════════════════════════════════════════╝

🔐 Authenticating test user...
   ✅ Logged in as: test@stress.com

📊 Testing 30 Query Operations...
   Progress: 30/30 (15.2 req/s)
   ✅ Query tests completed

🔥 CONCURRENT STRESS TEST
   Total Requests: 100
   Concurrent Users: 10

   Batch 10/10 | Completed: 100/100 | Rate: 45.2 req/s | Avg: 221ms

   ✅ Completed in 2.21s
   📈 Average Rate: 45.20 requests/second

═══════════════════════════════════════════════════════════════════
                    FULL FLOW STRESS TEST REPORT
═══════════════════════════════════════════════════════════════════

📊 QUERY OPERATIONS:
   Success: 30 | Failed: 0
   Response Times (ms):
     Min: 45 | Max: 312 | Avg: 156
     P50: 142 | P90: 245 | P95: 289

🔥 CONCURRENT LOAD TEST:
   Success: 100 | Failed: 0
   Error Rate: 0.00%
   Response Times (ms):
     Min: 89 | Max: 567 | Avg: 221
     P50: 198 | P90: 345 | P95: 412

📈 OVERALL PERFORMANCE:
   ⭐⭐⭐⭐⭐ EXCELLENT - Your app handles stress very well!
```

## 🐛 Troubleshooting

### "Connection refused" error
- Make sure your API server is running: `cd api && npm run dev`
- Check that the port in `config.js` matches your API port

### "Unauthorized" errors
- The test tries to create a test user automatically
- Check that user signup is working in your API

### Database connection errors
- Verify MySQL is running
- Check `.env` file in `/api` folder has correct credentials
- Try running `db-stress-test.js` to diagnose connection issues
