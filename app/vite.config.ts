import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig(({ mode }) => {
  const url = process.env.VITE_GRAPHQL_URL;
  const isProduction = mode === 'production' || process.env.NODE_ENV === 'production';

  if (process.env.CI && !url) {
    throw new Error('VITE_GRAPHQL_URL is required in CI builds. Set it to /graphql if Nginx proxies the API.');
  }

  if (url && process.env.CI && url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    throw new Error(`VITE_GRAPHQL_URL uses plaintext HTTP in production: ${url}. Use HTTPS or same-origin /graphql.`);
  }

  return {
    plugins: [
      react(),
      ...(isProduction ? [removeConsole()] : []),
    ],
    server: {
      port: 3000,
    },
    build: {
      sourcemap: !isProduction,
    },
  };
});
