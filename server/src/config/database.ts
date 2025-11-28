/**
 * Database Configuration
 * Prisma Client singleton
 */

import { PrismaClient } from '@prisma/client';
import config from './index.js';

// Create Prisma client with logging in development
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: config.isDev ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Use global singleton to prevent multiple instances during hot reload
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (config.isDev) {
  globalThis.prisma = prisma;
}

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('📊 Database disconnected');
};

// Connect and test database
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('📊 Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default prisma;
