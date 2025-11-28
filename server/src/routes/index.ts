/**
 * API Routes Index
 * Combines all route modules
 */

import { Router } from 'express';
import authRoutes from './auth.js';
import transactionRoutes from './transactions.js';
import savingsRoutes from './savings.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/savings', savingsRoutes);

export default router;
