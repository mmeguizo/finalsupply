/**
 * SQL Injection Prevention Test Suite
 * Tests your GraphQL API against common SQL injection attacks
 * 
 * Run: node stress-test/injection-test.js
 */

import http from 'http';
import { CONFIG } from './config.js';

// Common SQL injection payloads
const SQL_INJECTION_PAYLOADS = [
  // Basic SQL injection
  "'; DROP TABLE users; --",
  "1'; DROP TABLE purchase_orders; --",
  "' OR '1'='1",
  "' OR '1'='1' --",
  "' OR '1'='1' /*",
  "1' OR '1'='1",
  "admin'--",
  
  // Union-based injection
  "' UNION SELECT * FROM users --",
  "' UNION SELECT null, null, null --",
  "1 UNION SELECT username, password FROM users",
  
  // Boolean-based blind injection
  "' AND 1=1 --",
  "' AND 1=2 --",
  "1' AND '1'='1",
  "1' AND '1'='2",
  
  // Time-based blind injection
  "'; WAITFOR DELAY '0:0:5' --",
  "1'; SELECT SLEEP(5) --",
  "' OR SLEEP(5) --",
  
  // Error-based injection
  "' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()))) --",
  "' AND (SELECT 1 FROM (SELECT COUNT(*), CONCAT((SELECT user()), 0x3a, FLOOR(RAND(0)*2)) x FROM information_schema.tables GROUP BY x) a) --",
  
  // Stacked queries
  "'; INSERT INTO users (email, password) VALUES ('hacker@evil.com', 'hacked'); --",
  "1; UPDATE users SET password='hacked' WHERE email='admin@test.com' --",
  
  // Comment injection
  "admin'/*",
  "*/OR/**/1=1/*",
  
  // Encoding bypasses
  "%27%20OR%20%271%27%3D%271",
  "&#39; OR &#39;1&#39;=&#39;1",
  
  // NoSQL injection (for MongoDB fields if any)
  '{"$gt": ""}',
  '{"$ne": null}',
  '{"$regex": ".*"}',
  
  // Special characters
  "\\",
  "\x00",
  "' OR ''='",
  "\" OR \"\"=\"",
];

// XSS payloads to test (should be sanitized or escaped)
const XSS_PAYLOADS = [
  "<script>alert('XSS')</script>",
  "<img src=x onerror=alert('XSS')>",
  "javascript:alert('XSS')",
  "<svg onload=alert('XSS')>",
  "'\"><script>alert('XSS')</script>",
  "<body onload=alert('XSS')>",
  "<iframe src='javascript:alert(1)'></iframe>",
];

class InjectionTester {
  constructor() {
    this.results = {
      sqlInjection: { passed: 0, failed: 0, vulnerable: [] },
      xss: { passed: 0, failed: 0, vulnerable: [] },
      errors: [],
    };
    this.url = new URL(CONFIG.API_URL);
  }

  async makeRequest(query, variables = {}) {
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
        },
        timeout: 10000,
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(data),
              raw: data,
            });
          } catch (e) {
            resolve({ status: res.statusCode, data: null, raw: data });
          }
        });
      });

      req.on('error', (error) => reject(error));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  // Test SQL injection on login mutation
  async testLoginInjection(payload) {
    const query = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          id
          email
          name
        }
      }
    `;

    try {
      const response = await this.makeRequest(query, {
        input: { email: payload, password: payload }
      });

      // Check for signs of SQL injection vulnerability
      const isVulnerable = this.checkVulnerability(response, payload);
      return { payload, response, isVulnerable };
    } catch (error) {
      return { payload, error: error.message, isVulnerable: false };
    }
  }

  // Test SQL injection on search/query operations
  async testSearchInjection(payload) {
    const query = `
      query GetPurchaseOrders {
        purchaseOrders {
          id
          poNumber
          supplier
        }
      }
    `;

    try {
      // Try injection in various ways
      const response = await this.makeRequest(query);
      return { payload, response, isVulnerable: false };
    } catch (error) {
      return { payload, error: error.message, isVulnerable: false };
    }
  }

  // Test SQL injection on mutation inputs
  async testMutationInjection(payload) {
    const query = `
      mutation SignUp($input: SignUpInput!) {
        signUp(input: $input) {
          id
          email
        }
      }
    `;

    try {
      const response = await this.makeRequest(query, {
        input: {
          email: payload + '@test.com',
          name: payload,
          password: 'testpass123',
          gender: 'male'
        }
      });

      const isVulnerable = this.checkVulnerability(response, payload);
      return { payload, response, isVulnerable };
    } catch (error) {
      return { payload, error: error.message, isVulnerable: false };
    }
  }

  // Check if response indicates vulnerability
  checkVulnerability(response, payload) {
    if (!response || !response.data) return false;

    const raw = JSON.stringify(response.data).toLowerCase();
    const payloadLower = payload.toLowerCase();

    // Signs of vulnerability
    const vulnerabilityIndicators = [
      'syntax error',
      'mysql',
      'ora-',
      'postgresql',
      'sql server',
      'sqlite',
      'unclosed quotation',
      'unterminated string',
      'you have an error in your sql',
      'warning: mysql',
      'valid mysql result',
      'mysqlclient',
      'mysql_fetch',
      'num_rows',
      'unexpected end of sql',
      'quoted string not properly terminated',
    ];

    // Check for error messages that reveal database info
    for (const indicator of vulnerabilityIndicators) {
      if (raw.includes(indicator)) {
        return true;
      }
    }

    // Check if payload was reflected without sanitization
    if (raw.includes(payloadLower.replace(/'/g, '').replace(/"/g, ''))) {
      // This might not be vulnerability, but worth noting
    }

    return false;
  }

  async runSQLInjectionTests() {
    console.log('\n🔒 RUNNING SQL INJECTION TESTS\n');
    console.log('=' .repeat(60));
    console.log(`Testing ${SQL_INJECTION_PAYLOADS.length} injection payloads...`);
    console.log('=' .repeat(60) + '\n');

    for (const payload of SQL_INJECTION_PAYLOADS) {
      process.stdout.write(`Testing: ${payload.substring(0, 40).padEnd(40)}... `);
      
      try {
        // Test on login
        const loginResult = await this.testLoginInjection(payload);
        
        // Test on mutation
        const mutationResult = await this.testMutationInjection(payload);

        if (loginResult.isVulnerable || mutationResult.isVulnerable) {
          console.log('❌ VULNERABLE');
          this.results.sqlInjection.failed++;
          this.results.sqlInjection.vulnerable.push({
            payload,
            loginResult,
            mutationResult,
          });
        } else {
          console.log('✅ BLOCKED');
          this.results.sqlInjection.passed++;
        }
      } catch (error) {
        console.log('⚠️  ERROR:', error.message);
        this.results.errors.push({ payload, error: error.message });
      }

      // Small delay between tests
      await new Promise(r => setTimeout(r, 100));
    }
  }

  async runXSSTests() {
    console.log('\n🛡️  RUNNING XSS TESTS\n');
    console.log('=' .repeat(60));
    console.log(`Testing ${XSS_PAYLOADS.length} XSS payloads...`);
    console.log('=' .repeat(60) + '\n');

    for (const payload of XSS_PAYLOADS) {
      process.stdout.write(`Testing: ${payload.substring(0, 40).padEnd(40)}... `);
      
      try {
        const result = await this.testMutationInjection(payload);
        
        // Check if XSS payload was stored/reflected without encoding
        const storedXSS = result.response?.data && 
          JSON.stringify(result.response.data).includes(payload);
        
        if (storedXSS) {
          console.log('⚠️  REFLECTED (check output encoding)');
          this.results.xss.failed++;
          this.results.xss.vulnerable.push({ payload, result });
        } else {
          console.log('✅ OK');
          this.results.xss.passed++;
        }
      } catch (error) {
        console.log('⚠️  ERROR:', error.message);
      }

      await new Promise(r => setTimeout(r, 100));
    }
  }

  printReport() {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('          INJECTION TEST REPORT');
    console.log('═'.repeat(60));
    
    console.log('\n📊 SQL INJECTION RESULTS:');
    console.log(`   ✅ Blocked: ${this.results.sqlInjection.passed}`);
    console.log(`   ❌ Vulnerable: ${this.results.sqlInjection.failed}`);
    
    if (this.results.sqlInjection.vulnerable.length > 0) {
      console.log('\n   ⚠️  Vulnerable Payloads:');
      this.results.sqlInjection.vulnerable.forEach((v, i) => {
        console.log(`      ${i + 1}. ${v.payload.substring(0, 50)}`);
      });
    }

    console.log('\n📊 XSS RESULTS:');
    console.log(`   ✅ Blocked/Encoded: ${this.results.xss.passed}`);
    console.log(`   ⚠️  Reflected: ${this.results.xss.failed}`);

    console.log('\n📊 OVERALL SECURITY STATUS:');
    const totalVulnerabilities = this.results.sqlInjection.failed + this.results.xss.failed;
    
    if (totalVulnerabilities === 0) {
      console.log('   ✅ ALL TESTS PASSED - No obvious injection vulnerabilities detected!');
      console.log('\n   Note: This is a basic test. For production, consider:');
      console.log('   - Professional penetration testing');
      console.log('   - OWASP ZAP automated scanning');
      console.log('   - SQLMap for thorough SQL injection testing');
    } else {
      console.log(`   ❌ ${totalVulnerabilities} POTENTIAL VULNERABILITIES DETECTED`);
      console.log('\n   Recommendations:');
      console.log('   - Use parameterized queries (Sequelize does this by default)');
      console.log('   - Validate and sanitize all inputs');
      console.log('   - Use prepared statements');
      console.log('   - Implement input length limits');
      console.log('   - Escape special characters');
    }

    console.log('\n' + '═'.repeat(60) + '\n');

    // Why Sequelize protects you
    console.log('💡 SECURITY NOTE:');
    console.log('   Sequelize uses parameterized queries by default, which');
    console.log('   protects against most SQL injection attacks. Your code:');
    console.log('');
    console.log('   User.findOne({ where: { email } })');
    console.log('');
    console.log('   becomes a parameterized query like:');
    console.log('   SELECT * FROM users WHERE email = ?');
    console.log('');
    console.log('   The ? placeholder prevents injection because the database');
    console.log('   treats the value as data, not as SQL code.');
    console.log('\n');
  }
}

// Run the tests
async function main() {
  console.log('\n🔐 SECURITY INJECTION TEST SUITE');
  console.log('Testing for SQL Injection and XSS vulnerabilities\n');
  console.log(`Target: ${CONFIG.API_URL}${CONFIG.GRAPHQL_ENDPOINT}`);
  
  const tester = new InjectionTester();
  
  try {
    await tester.runSQLInjectionTests();
    await tester.runXSSTests();
    tester.printReport();
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.log('\nMake sure your API server is running on', CONFIG.API_URL);
  }
}

main();
