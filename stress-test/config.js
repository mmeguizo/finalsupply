/**
 * Stress Test Configuration
 * Modify these settings based on your environment
 */

export const CONFIG = {
  // API Configuration
  API_URL: process.env.API_URL || 'http://localhost:4000',
  GRAPHQL_ENDPOINT: '/graphql',

  // Test User Credentials (create a test user first)
  TEST_USER: {
    email: 'test@stress.com',
    password: 'testpassword123',
    name: 'Stress Test User',
    gender: 'male'
  },

  // Stress Test Settings
  STRESS: {
    TOTAL_REQUESTS: 100,          // Total number of requests to make
    CONCURRENT_USERS: 10,         // Number of concurrent users/connections
    RAMP_UP_TIME: 5000,           // Time in ms to ramp up to full load
    THINK_TIME: { MIN: 100, MAX: 500 }, // Random delay between requests (ms)
  },

  // Database Stress Settings
  DB_STRESS: {
    CONCURRENT_QUERIES: 50,
    QUERY_BATCHES: 5,
  },

  // Thresholds (for pass/fail)
  THRESHOLDS: {
    MAX_RESPONSE_TIME_P95: 2000,  // 95th percentile should be under 2s
    MAX_ERROR_RATE: 5,            // Max 5% error rate
    MIN_REQUESTS_PER_SEC: 10,     // Minimum requests per second
  }
};
