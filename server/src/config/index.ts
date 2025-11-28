/**
 * Application Configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};

// Validate required config
export const validateConfig = (): void => {
  const required = ['databaseUrl', 'jwt.accessSecret', 'jwt.refreshSecret'];
  const missing: string[] = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (config.jwt.accessSecret === 'default-access-secret') {
    console.warn('⚠️  Using default JWT access secret. Set JWT_ACCESS_SECRET in production!');
  }
  if (config.jwt.refreshSecret === 'default-refresh-secret') {
    console.warn('⚠️  Using default JWT refresh secret. Set JWT_REFRESH_SECRET in production!');
  }

  if (missing.length > 0 && config.isProd) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

export default config;
