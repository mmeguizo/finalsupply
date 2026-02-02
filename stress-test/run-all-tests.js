/**
 * Quick Stress Test Runner
 * Simple script to run all stress tests with a summary
 * 
 * Run: node stress-test/run-all-tests.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tests = [
  {
    name: 'SQL Injection Test',
    script: 'injection-test.js',
    description: 'Tests for SQL injection and XSS vulnerabilities',
  },
  {
    name: 'Full Flow Stress Test',
    script: 'full-flow-test.js',
    description: 'Tests complete flow: Auth → CRUD → Response',
  },
  {
    name: 'Database Stress Test',
    script: 'db-stress-test.js',
    description: 'Tests database connection pool and query performance',
  },
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log('\n' + '─'.repeat(70));
    console.log(`🧪 Running: ${test.name}`);
    console.log(`   ${test.description}`);
    console.log('─'.repeat(70) + '\n');

    const scriptPath = join(__dirname, test.script);
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: dirname(__dirname),
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ name: test.name, success: true });
      } else {
        resolve({ name: test.name, success: false, code });
      }
    });

    child.on('error', (error) => {
      resolve({ name: test.name, success: false, error: error.message });
    });
  });
}

async function main() {
  console.log('\n');
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + '            STRESS TEST SUITE RUNNER'.padEnd(68) + '║');
  console.log('║' + '       Running all security and performance tests'.padEnd(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');

  const results = [];

  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }

  // Summary
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('                    TEST SUITE SUMMARY');
  console.log('═'.repeat(70));
  console.log('\n');

  results.forEach(result => {
    const status = result.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`   ${status}  ${result.name}`);
  });

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  console.log('\n' + '─'.repeat(70));
  console.log(`   Overall: ${passed}/${total} test suites completed successfully`);
  console.log('─'.repeat(70) + '\n');
}

main();
