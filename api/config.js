import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isBehindProxy = process.env.TRUST_PROXY === 'true' || isProduction;

function required(key) {
  const val = process.env[key];
  if (!val || (typeof val === 'string' && !val.trim())) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val.trim();
}

function optional(key, fallback) {
  const val = process.env[key];
  return val != null && val !== '' ? val.trim() : fallback;
}

function parseOrigins(raw) {
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function validate() {
  const errors = [];

  if (!process.env.MYSQL_HOST) errors.push('MYSQL_HOST');
  if (!process.env.MYSQL_USER) errors.push('MYSQL_USER');
  if (!process.env.MYSQL_PASSWORD === undefined) errors.push('MYSQL_PASSWORD');
  if (!process.env.MYSQL_DATABASE) errors.push('MYSQL_DATABASE');
  if (!process.env.SESSION_SECRET) errors.push('SESSION_SECRET');

  if (isProduction) {
    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 16) {
      errors.push('SESSION_SECRET must be at least 16 characters in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n  ${errors.join('\n  ')}`);
  }
}

validate();

const rawOrigins = optional('CORS_ORIGINS', '*');
const corsOrigins = parseOrigins(rawOrigins);

if (isProduction) {
  const rejected = corsOrigins.filter(
    (o) => o.includes('localhost') || o.includes('ngrok') || o.includes('/')
  );
  if (rejected.length > 0) {
    throw new Error(
      `Production CORS_ORIGINS contains invalid values: ${rejected.join(', ')}`
    );
  }
}

export const config = {
  NODE_ENV,
  isProduction,
  isBehindProxy,

  host: optional('MYSQL_HOST', '127.0.0.1'),
  user: required('MYSQL_USER'),
  password: optional('MYSQL_PASSWORD', ''),
  database: required('MYSQL_DATABASE'),

  sessionSecret: process.env.SESSION_SECRET,
  cookieName: optional('SESSION_COOKIE_NAME', 'connect.sid'),
  cookieSecure: optional('SESSION_COOKIE_SECURE', String(isProduction)) === 'true',
  cookieSameSite: optional('SESSION_COOKIE_SAMESITE', 'lax'),

  port: parseInt(optional('PORT', '4000'), 10),
  corsOrigins,
  bodyLimit: optional('BODY_LIMIT', '1mb'),

  rateLimitWindow: parseInt(optional('RATE_LIMIT_WINDOW_MS', '60000'), 10),
  rateLimitMax: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  rateLimitLoginMax: parseInt(optional('RATE_LIMIT_LOGIN_MAX', '10'), 10),
  graphqlMaxDepth: parseInt(optional('GRAPHQL_MAX_DEPTH', '10'), 10),
};
