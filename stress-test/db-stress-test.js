/**
 * Database Connection Pool Stress Test
 * Tests MySQL connection handling under load
 * 
 * Run: node stress-test/db-stress-test.js
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from api folder
dotenv.config({ path: join(__dirname, '..', 'api', '.env') });

class DatabaseStressTester {
  constructor() {
    this.metrics = {
      connectionTests: [],
      queryTests: [],
      transactionTests: [],
      errors: [],
    };

    // Create a test Sequelize instance with pool monitoring
    this.sequelize = new Sequelize({
      dialect: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'supply_db',
      logging: false,
      pool: {
        max: 20,        // Maximum connections
        min: 5,         // Minimum connections
        acquire: 30000, // Max time to acquire connection
        idle: 10000,    // Connection idle timeout
      },
      // Enable query timing
      benchmark: true,
    });
  }

  async testConnection() {
    console.log('🔌 Testing database connection...\n');
    
    try {
      const startTime = Date.now();
      await this.sequelize.authenticate();
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Connected in ${duration}ms`);
      console.log(`   Host: ${process.env.MYSQL_HOST || 'localhost'}`);
      console.log(`   Database: ${process.env.MYSQL_DATABASE}`);
      return true;
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      return false;
    }
  }

  async runConcurrentQueries(queryCount, description) {
    console.log(`\n📊 ${description}`);
    console.log(`   Running ${queryCount} concurrent queries...\n`);

    const startTime = Date.now();
    const results = [];

    const promises = Array(queryCount).fill(null).map(async (_, index) => {
      const queryStart = Date.now();
      try {
        // Mix of different query types
        const queryType = index % 4;
        let result;

        switch (queryType) {
          case 0:
            // Simple select
            result = await this.sequelize.query('SELECT 1+1 as result');
            break;
          case 1:
            // Count query
            result = await this.sequelize.query('SELECT COUNT(*) as count FROM purchase_orders');
            break;
          case 2:
            // Select with limit
            result = await this.sequelize.query('SELECT * FROM purchase_orders LIMIT 10');
            break;
          case 3:
            // Join query (using correct snake_case column names)
            result = await this.sequelize.query(`
              SELECT po.id, COUNT(poi.id) as item_count 
              FROM purchase_orders po 
              LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id 
              GROUP BY po.id 
              LIMIT 10
            `);
            break;
        }

        const duration = Date.now() - queryStart;
        return { success: true, duration, index };
      } catch (error) {
        const duration = Date.now() - queryStart;
        return { success: false, duration, error: error.message, index };
      }
    });

    const allResults = await Promise.all(promises);
    const totalDuration = Date.now() - startTime;

    // Calculate metrics
    const successful = allResults.filter(r => r.success);
    const failed = allResults.filter(r => !r.success);
    const durations = allResults.map(r => r.duration).sort((a, b) => a - b);

    const stats = {
      total: queryCount,
      successful: successful.length,
      failed: failed.length,
      totalDuration,
      queriesPerSecond: (queryCount / (totalDuration / 1000)).toFixed(2),
      min: durations[0],
      max: durations[durations.length - 1],
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };

    this.metrics.queryTests.push({ description, ...stats });

    console.log(`   ✅ Completed in ${totalDuration}ms`);
    console.log(`   Successful: ${stats.successful} | Failed: ${stats.failed}`);
    console.log(`   Queries/sec: ${stats.queriesPerSecond}`);
    console.log(`   Response (ms): Min ${stats.min} | Avg ${stats.avg} | P95 ${stats.p95} | Max ${stats.max}`);

    if (failed.length > 0) {
      console.log(`\n   Errors:`);
      const errorGroups = {};
      failed.forEach(f => {
        errorGroups[f.error] = (errorGroups[f.error] || 0) + 1;
      });
      Object.entries(errorGroups).slice(0, 3).forEach(([err, count]) => {
        console.log(`     ${count}x: ${err.substring(0, 50)}`);
      });
    }

    return stats;
  }

  async testTransactions(count) {
    console.log(`\n💾 Testing ${count} concurrent transactions...\n`);

    const startTime = Date.now();
    const results = [];

    const promises = Array(count).fill(null).map(async (_, index) => {
      const txStart = Date.now();
      const t = await this.sequelize.transaction();
      
      try {
        // Simulate a realistic transaction
        await this.sequelize.query('SELECT 1', { transaction: t });
        
        // Create temp record using snake_case column names (rollback after)
        const poNumber = `STRESS-TEST-${Date.now()}-${index}`;
        await this.sequelize.query(
          `INSERT INTO purchase_orders (po_number, supplier, mode_of_procurement, place_of_delivery, date_of_delivery, date_of_payment, amount, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, CURDATE(), CURDATE(), 0, 'pending', NOW(), NOW())`,
          {
            replacements: [poNumber, 'Stress Test Supplier', 'Shopping', 'Test Location'],
            transaction: t,
          }
        );

        // Verify insert
        await this.sequelize.query(
          'SELECT * FROM purchase_orders WHERE po_number = ?',
          { replacements: [poNumber], transaction: t }
        );

        // Rollback to not pollute database
        await t.rollback();
        
        const duration = Date.now() - txStart;
        return { success: true, duration };
      } catch (error) {
        await t.rollback();
        const duration = Date.now() - txStart;
        return { success: false, duration, error: error.message };
      }
    });

    const allResults = await Promise.all(promises);
    const totalDuration = Date.now() - startTime;

    const successful = allResults.filter(r => r.success);
    const failed = allResults.filter(r => !r.success);
    const durations = allResults.map(r => r.duration).sort((a, b) => a - b);

    console.log(`   ✅ Completed in ${totalDuration}ms`);
    console.log(`   Successful: ${successful.length} | Failed: ${failed.length}`);
    console.log(`   Transactions/sec: ${(count / (totalDuration / 1000)).toFixed(2)}`);
    console.log(`   Response (ms): Min ${durations[0]} | Avg ${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)} | Max ${durations[durations.length - 1]}`);

    this.metrics.transactionTests.push({
      count,
      successful: successful.length,
      failed: failed.length,
      totalDuration,
    });
  }

  async testConnectionPoolExhaustion() {
    console.log('\n🏊 Testing connection pool under extreme load...\n');
    console.log('   This tests what happens when all connections are busy\n');

    // Get current pool settings
    const poolConfig = this.sequelize.config.pool;
    console.log(`   Pool Configuration:`);
    console.log(`     Max Connections: ${poolConfig.max}`);
    console.log(`     Min Connections: ${poolConfig.min}`);
    console.log(`     Acquire Timeout: ${poolConfig.acquire}ms`);
    console.log('');

    // Try to exhaust the pool by requesting more connections than available
    const overloadFactor = 3; // 3x the max connections
    const connectionCount = poolConfig.max * overloadFactor;

    console.log(`   Requesting ${connectionCount} simultaneous connections...`);

    const startTime = Date.now();
    let acquired = 0;
    let failed = 0;
    let pending = 0;

    const promises = Array(connectionCount).fill(null).map(async (_, index) => {
      pending++;
      try {
        // Long-running query to hold connection
        await this.sequelize.query('SELECT SLEEP(0.1) as result');
        acquired++;
        return { success: true };
      } catch (error) {
        failed++;
        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    const totalDuration = Date.now() - startTime;

    console.log(`\n   Results after ${totalDuration}ms:`);
    console.log(`   ✅ Acquired & completed: ${acquired}`);
    console.log(`   ❌ Failed to acquire: ${failed}`);
    console.log(`   📊 Throughput: ${(acquired / (totalDuration / 1000)).toFixed(2)} connections/sec`);

    if (failed > 0) {
      console.log('\n   ⚠️  Pool exhaustion detected! Consider:');
      console.log('      - Increasing pool.max in Sequelize config');
      console.log('      - Optimizing slow queries');
      console.log('      - Adding connection timeout handling');
    } else {
      console.log('\n   ✅ Pool handled the load well');
    }
  }

  async testSlowQueryDetection() {
    console.log('\n🐌 Testing slow query detection...\n');

    const queries = [
      { name: 'Simple COUNT', sql: 'SELECT COUNT(*) FROM purchase_orders' },
      { name: 'Full table scan', sql: 'SELECT * FROM purchase_orders' },
      { name: 'Join query', sql: `
        SELECT po.*, poi.item_name 
        FROM purchase_orders po 
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
      `},
      { name: 'Aggregation', sql: `
        SELECT po.id, SUM(poi.amount) as total
        FROM purchase_orders po
        LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
        GROUP BY po.id
      `},
    ];

    for (const query of queries) {
      const times = [];
      
      // Run query 5 times for average
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        try {
          await this.sequelize.query(query.sql);
          times.push(Date.now() - start);
        } catch (error) {
          console.log(`   ❌ ${query.name}: ${error.message}`);
          break;
        }
      }

      if (times.length > 0) {
        const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        const status = avg < 100 ? '✅' : avg < 500 ? '⚠️' : '❌';
        console.log(`   ${status} ${query.name.padEnd(20)}: ${avg}ms avg`);
      }
    }
  }

  printFinalReport() {
    console.log('\n');
    console.log('═'.repeat(70));
    console.log('                 DATABASE STRESS TEST REPORT');
    console.log('═'.repeat(70));

    console.log('\n📊 QUERY PERFORMANCE SUMMARY:');
    this.metrics.queryTests.forEach(test => {
      console.log(`\n   ${test.description}:`);
      console.log(`     Queries/sec: ${test.queriesPerSecond}`);
      console.log(`     Success Rate: ${((test.successful / test.total) * 100).toFixed(1)}%`);
      console.log(`     P95 Response: ${test.p95}ms`);
    });

    if (this.metrics.transactionTests.length > 0) {
      console.log('\n💾 TRANSACTION PERFORMANCE:');
      this.metrics.transactionTests.forEach(test => {
        console.log(`   ${test.count} concurrent transactions`);
        console.log(`   Success Rate: ${((test.successful / test.count) * 100).toFixed(1)}%`);
      });
    }

    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    console.log('   1. Add indexes to frequently queried columns:');
    console.log('      - purchaseOrderId on purchase_order_items');
    console.log('      - status on purchase_orders');
    console.log('      - createdAt for date-based queries');
    console.log('');
    console.log('   2. Connection Pool Settings:');
    console.log('      pool: {');
    console.log('        max: 20,        // Increase for high traffic');
    console.log('        min: 5,         // Keep warm connections');
    console.log('        acquire: 30000, // Wait time for connection');
    console.log('        idle: 10000     // Release idle connections');
    console.log('      }');
    console.log('');
    console.log('   3. Query Optimization:');
    console.log('      - Use LIMIT for list queries');
    console.log('      - Implement cursor-based pagination');
    console.log('      - Cache frequently accessed data');
    console.log('\n' + '═'.repeat(70) + '\n');
  }

  async cleanup() {
    await this.sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

async function main() {
  console.log('\n');
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + '           DATABASE STRESS TEST SUITE'.padEnd(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');

  const tester = new DatabaseStressTester();

  try {
    // Test connection
    const connected = await tester.testConnection();
    if (!connected) {
      console.log('\n❌ Cannot proceed without database connection');
      return;
    }

    // Test concurrent queries with increasing load
    await tester.runConcurrentQueries(10, 'Light Load (10 queries)');
    await tester.runConcurrentQueries(50, 'Medium Load (50 queries)');
    await tester.runConcurrentQueries(100, 'Heavy Load (100 queries)');
    await tester.runConcurrentQueries(200, 'Extreme Load (200 queries)');

    // Test transactions
    await tester.testTransactions(20);

    // Test pool exhaustion
    await tester.testConnectionPoolExhaustion();

    // Test slow queries
    await tester.testSlowQueryDetection();

    // Final report
    tester.printFinalReport();

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
  } finally {
    await tester.cleanup();
  }
}

main();
