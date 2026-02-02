/**
 * Full Flow Stress Test
 * Tests the complete flow: Authentication → CRUD Operations → Database → Response
 * 
 * Run: node stress-test/full-flow-test.js
 */

import http from 'http';
import { CONFIG } from './config.js';

class FullFlowStressTester {
  constructor() {
    this.url = new URL(CONFIG.API_URL);
    this.sessionCookie = null;
    this.metrics = {
      login: { times: [], success: 0, failed: 0 },
      query: { times: [], success: 0, failed: 0 },
      mutation: { times: [], success: 0, failed: 0 },
      total: { times: [], success: 0, failed: 0 },
      errors: [],
    };
    this.createdItems = [];
  }

  async makeRequest(query, variables = {}, retries = 2) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ query, variables });

      const options = {
        hostname: this.url.hostname,
        port: this.url.port || 80,
        path: CONFIG.GRAPHQL_ENDPOINT,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(this.sessionCookie ? { 'Cookie': this.sessionCookie } : {}),
        },
        timeout: 30000,
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        // Capture session cookie
        if (res.headers['set-cookie']) {
          this.sessionCookie = res.headers['set-cookie'][0].split(';')[0];
        }

        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          try {
            const parsed = JSON.parse(data);
            resolve({
              status: res.statusCode,
              data: parsed,
              responseTime,
              success: !parsed.errors,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: null,
              responseTime,
              success: false,
              parseError: e.message,
            });
          }
        });
      });

      req.on('error', async (error) => {
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 1000));
          try {
            const result = await this.makeRequest(query, variables, retries - 1);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(error);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout after 30s'));
      });

      req.write(postData);
      req.end();
    });
  }

  // Step 1: Login or create test user
  async authenticateUser() {
    console.log('🔐 Authenticating test user...\n');

    // Try to login first
    const loginQuery = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          id
          email
          name
        }
      }
    `;

    try {
      const loginResult = await this.makeRequest(loginQuery, {
        input: {
          email: CONFIG.TEST_USER.email,
          password: CONFIG.TEST_USER.password,
        }
      });

      if (loginResult.success && loginResult.data?.data?.login) {
        console.log('   ✅ Logged in as:', loginResult.data.data.login.email);
        return true;
      }

      // If login failed, try to create the user
      console.log('   ⚠️  Login failed, creating test user...');
      
      const signupQuery = `
        mutation SignUp($input: SignUpInput!) {
          signUp(input: $input) {
            id
            email
            name
          }
        }
      `;

      const signupResult = await this.makeRequest(signupQuery, {
        input: CONFIG.TEST_USER
      });

      if (signupResult.data?.data?.signUp) {
        console.log('   ✅ Created user:', signupResult.data.data.signUp.email);
        
        // Now login
        const retryLogin = await this.makeRequest(loginQuery, {
          input: {
            email: CONFIG.TEST_USER.email,
            password: CONFIG.TEST_USER.password,
          }
        });

        if (retryLogin.success && retryLogin.data?.data?.login) {
          console.log('   ✅ Logged in successfully');
          return true;
        }
      }

      console.log('   ❌ Authentication failed');
      return false;
    } catch (error) {
      console.log('   ❌ Authentication error:', error.message);
      return false;
    }
  }

  // Step 2: Test Query Performance
  async testQueries(count) {
    console.log(`\n📊 Testing ${count} Query Operations...\n`);

    const queries = [
      {
        name: 'getPurchaseOrders',
        query: `
          query {
            purchaseOrders {
              id
              poNumber
              supplier
              status
            }
          }
        `,
      },
      {
        name: 'getAllPurchaseOrderItems',
        query: `
          query {
            allPurchaseOrderItems {
              id
              itemName
              quantity
              unitCost
            }
          }
        `,
      },
      {
        name: 'getTotalAmount',
        query: `
          query {
            getAllTotalPurchaseOrderAmount
          }
        `,
      },
    ];

    let completed = 0;
    const startTime = Date.now();

    for (let i = 0; i < count; i++) {
      const randomQuery = queries[i % queries.length];
      
      try {
        const result = await this.makeRequest(randomQuery.query);
        
        this.metrics.query.times.push(result.responseTime);
        
        if (result.success) {
          this.metrics.query.success++;
        } else {
          this.metrics.query.failed++;
          if (result.data?.errors) {
            this.metrics.errors.push({
              type: 'query',
              query: randomQuery.name,
              error: result.data.errors[0]?.message,
            });
          }
        }
      } catch (error) {
        this.metrics.query.failed++;
        this.metrics.errors.push({
          type: 'query',
          query: randomQuery.name,
          error: error.message,
        });
      }

      completed++;
      if (completed % 10 === 0 || completed === count) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (completed / elapsed).toFixed(1);
        process.stdout.write(`\r   Progress: ${completed}/${count} (${rate} req/s)`);
      }
    }

    console.log('\n   ✅ Query tests completed');
  }

  // Step 3: Test Mutation Performance (CRUD operations)
  async testMutations(count) {
    console.log(`\n✏️  Testing ${count} Mutation Operations...\n`);

    let completed = 0;
    const startTime = Date.now();

    for (let i = 0; i < count; i++) {
      const uniqueId = Date.now().toString() + i;
      
      // Create a purchase order (or test other mutations)
      const createMutation = `
        mutation AddPurchaseOrder($input: PurchaseOrderInput!) {
          addPurchaseOrder(input: $input) {
            id
            poNumber
            supplier
          }
        }
      `;

      try {
        const result = await this.makeRequest(createMutation, {
          input: {
            poNumber: `STRESS-TEST-${uniqueId}`,
            supplier: `Stress Test Supplier ${i}`,
            address: 'Test Address',
            modeOfProcurement: 'Shopping',
            placeOfDelivery: 'Test Delivery',
            dateOfDelivery: new Date().toISOString().split('T')[0],
            dateOfPayment: new Date().toISOString().split('T')[0],
            status: 'pending',
            amount: 0,
            items: [],
          }
        });

        this.metrics.mutation.times.push(result.responseTime);

        if (result.success && result.data?.data?.addPurchaseOrder) {
          this.metrics.mutation.success++;
          this.createdItems.push(result.data.data.addPurchaseOrder.id);
        } else {
          this.metrics.mutation.failed++;
          if (result.data?.errors) {
            this.metrics.errors.push({
              type: 'mutation',
              operation: 'addPurchaseOrder',
              error: result.data.errors[0]?.message,
            });
          }
        }
      } catch (error) {
        this.metrics.mutation.failed++;
        this.metrics.errors.push({
          type: 'mutation',
          operation: 'addPurchaseOrder',
          error: error.message,
        });
      }

      completed++;
      if (completed % 5 === 0 || completed === count) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (completed / elapsed).toFixed(1);
        process.stdout.write(`\r   Progress: ${completed}/${count} (${rate} req/s)`);
      }

      // Small delay between mutations
      await new Promise(r => setTimeout(r, 50));
    }

    console.log('\n   ✅ Mutation tests completed');
  }

  // Step 4: Concurrent Stress Test
  async testConcurrentRequests(totalRequests, concurrentUsers) {
    console.log(`\n🔥 CONCURRENT STRESS TEST`);
    console.log(`   Total Requests: ${totalRequests}`);
    console.log(`   Concurrent Users: ${concurrentUsers}\n`);

    const query = `
      query {
        purchaseOrders {
          id
          poNumber
          supplier
        }
      }
    `;

    const startTime = Date.now();
    let completed = 0;
    let batchNumber = 0;
    const batches = Math.ceil(totalRequests / concurrentUsers);

    while (completed < totalRequests) {
      batchNumber++;
      const batchSize = Math.min(concurrentUsers, totalRequests - completed);
      const batchStartTime = Date.now();

      // Execute concurrent requests
      const promises = Array(batchSize).fill(null).map(() => 
        this.makeRequest(query)
          .then(result => {
            this.metrics.total.times.push(result.responseTime);
            if (result.success) {
              this.metrics.total.success++;
            } else {
              this.metrics.total.failed++;
            }
            return result;
          })
          .catch(error => {
            this.metrics.total.failed++;
            this.metrics.total.times.push(30000); // Timeout value
            return { error: error.message };
          })
      );

      await Promise.all(promises);
      completed += batchSize;

      const batchDuration = Date.now() - batchStartTime;
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (completed / totalDuration).toFixed(1);
      const avgBatchTime = (batchDuration / batchSize).toFixed(0);

      process.stdout.write(`\r   Batch ${batchNumber}/${batches} | Completed: ${completed}/${totalRequests} | Rate: ${rate} req/s | Avg: ${avgBatchTime}ms`);
    }

    const totalDuration = (Date.now() - startTime) / 1000;
    console.log(`\n\n   ✅ Completed in ${totalDuration.toFixed(2)}s`);
    console.log(`   📈 Average Rate: ${(completed / totalDuration).toFixed(2)} requests/second`);
  }

  // Cleanup test data
  async cleanupTestData() {
    if (this.createdItems.length === 0) return;

    console.log(`\n🧹 Cleaning up ${this.createdItems.length} test items...`);

    const deleteQuery = `
      mutation DeletePurchaseOrder($id: ID!) {
        deletePurchaseOrder(id: $id) {
          success
        }
      }
    `;

    let cleaned = 0;
    for (const id of this.createdItems) {
      try {
        await this.makeRequest(deleteQuery, { id });
        cleaned++;
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    console.log(`   ✅ Cleaned up ${cleaned} items`);
  }

  // Calculate statistics
  calculateStats(times) {
    if (times.length === 0) return null;

    const sorted = [...times].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: Math.round(sum / sorted.length),
      median: sorted[Math.floor(sorted.length / 2)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  // Print final report
  printReport() {
    console.log('\n');
    console.log('═'.repeat(70));
    console.log('                    FULL FLOW STRESS TEST REPORT');
    console.log('═'.repeat(70));

    // Query Stats
    if (this.metrics.query.times.length > 0) {
      const queryStats = this.calculateStats(this.metrics.query.times);
      console.log('\n📊 QUERY OPERATIONS:');
      console.log(`   Success: ${this.metrics.query.success} | Failed: ${this.metrics.query.failed}`);
      console.log(`   Response Times (ms):`);
      console.log(`     Min: ${queryStats.min} | Max: ${queryStats.max} | Avg: ${queryStats.avg}`);
      console.log(`     P50: ${queryStats.median} | P90: ${queryStats.p90} | P95: ${queryStats.p95}`);
    }

    // Mutation Stats
    if (this.metrics.mutation.times.length > 0) {
      const mutationStats = this.calculateStats(this.metrics.mutation.times);
      console.log('\n✏️  MUTATION OPERATIONS:');
      console.log(`   Success: ${this.metrics.mutation.success} | Failed: ${this.metrics.mutation.failed}`);
      console.log(`   Response Times (ms):`);
      console.log(`     Min: ${mutationStats.min} | Max: ${mutationStats.max} | Avg: ${mutationStats.avg}`);
      console.log(`     P50: ${mutationStats.median} | P90: ${mutationStats.p90} | P95: ${mutationStats.p95}`);
    }

    // Concurrent Stats
    if (this.metrics.total.times.length > 0) {
      const totalStats = this.calculateStats(this.metrics.total.times);
      console.log('\n🔥 CONCURRENT LOAD TEST:');
      console.log(`   Success: ${this.metrics.total.success} | Failed: ${this.metrics.total.failed}`);
      const errorRate = ((this.metrics.total.failed / (this.metrics.total.success + this.metrics.total.failed)) * 100).toFixed(2);
      console.log(`   Error Rate: ${errorRate}%`);
      console.log(`   Response Times (ms):`);
      console.log(`     Min: ${totalStats.min} | Max: ${totalStats.max} | Avg: ${totalStats.avg}`);
      console.log(`     P50: ${totalStats.median} | P90: ${totalStats.p90} | P95: ${totalStats.p95}`);

      // Thresholds check
      console.log('\n📋 THRESHOLD CHECKS:');
      const p95Pass = totalStats.p95 <= CONFIG.THRESHOLDS.MAX_RESPONSE_TIME_P95;
      const errorPass = parseFloat(errorRate) <= CONFIG.THRESHOLDS.MAX_ERROR_RATE;
      
      console.log(`   P95 Response Time: ${totalStats.p95}ms ${p95Pass ? '✅' : '❌'} (threshold: ${CONFIG.THRESHOLDS.MAX_RESPONSE_TIME_P95}ms)`);
      console.log(`   Error Rate: ${errorRate}% ${errorPass ? '✅' : '❌'} (threshold: ${CONFIG.THRESHOLDS.MAX_ERROR_RATE}%)`);
    }

    // Errors
    if (this.metrics.errors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      const errorGroups = {};
      this.metrics.errors.forEach(e => {
        const key = e.error || 'Unknown';
        errorGroups[key] = (errorGroups[key] || 0) + 1;
      });
      Object.entries(errorGroups).slice(0, 5).forEach(([error, count]) => {
        console.log(`   ${count}x: ${error.substring(0, 60)}`);
      });
    }

    // Performance Rating
    console.log('\n📈 OVERALL PERFORMANCE:');
    const allTimes = [...this.metrics.query.times, ...this.metrics.mutation.times, ...this.metrics.total.times];
    if (allTimes.length > 0) {
      const overallStats = this.calculateStats(allTimes);
      const totalErrors = this.metrics.query.failed + this.metrics.mutation.failed + this.metrics.total.failed;
      const totalSuccess = this.metrics.query.success + this.metrics.mutation.success + this.metrics.total.success;
      const errorRate = (totalErrors / (totalSuccess + totalErrors)) * 100;

      if (overallStats.p95 < 500 && errorRate < 1) {
        console.log('   ⭐⭐⭐⭐⭐ EXCELLENT - Your app handles stress very well!');
      } else if (overallStats.p95 < 1000 && errorRate < 5) {
        console.log('   ⭐⭐⭐⭐ GOOD - Performance is solid');
      } else if (overallStats.p95 < 2000 && errorRate < 10) {
        console.log('   ⭐⭐⭐ FAIR - Some optimization may help');
      } else if (overallStats.p95 < 5000 && errorRate < 20) {
        console.log('   ⭐⭐ NEEDS WORK - Performance bottlenecks detected');
      } else {
        console.log('   ⭐ POOR - Significant improvements needed');
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('   1. Add database connection pooling if not already configured');
    console.log('   2. Consider adding Redis caching for frequently accessed data');
    console.log('   3. Add rate limiting to protect against abuse');
    console.log('   4. Use database indexes on frequently queried columns');
    console.log('   5. Consider query pagination for large result sets');
    console.log('\n');
  }
}

// Main execution
async function main() {
  console.log('\n');
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + '         FULL FLOW STRESS TEST SUITE'.padEnd(68) + '║');
  console.log('║' + `         Target: ${CONFIG.API_URL}`.padEnd(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');

  const tester = new FullFlowStressTester();

  try {
    // Step 1: Authenticate
    const authenticated = await tester.authenticateUser();
    if (!authenticated) {
      console.log('\n⚠️  Running tests without authentication...');
    }

    // Step 2: Test queries
    await tester.testQueries(30);

    // Step 3: Test mutations (reduced count to avoid too much test data)
    await tester.testMutations(10);

    // Step 4: Concurrent stress test
    await tester.testConcurrentRequests(
      CONFIG.STRESS.TOTAL_REQUESTS,
      CONFIG.STRESS.CONCURRENT_USERS
    );

    // Cleanup
    await tester.cleanupTestData();

    // Report
    tester.printReport();

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.log('\nMake sure your API server is running on', CONFIG.API_URL);
  }
}

main();
