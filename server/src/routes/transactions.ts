/**
 * Transaction Routes
 */

import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as transactionController from '../controllers/transactionController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation
const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

// Routes
router.get('/', asyncHandler(transactionController.getTransactions));
router.get('/stats', asyncHandler(transactionController.getTransactionStats));
router.get('/:id', asyncHandler(transactionController.getTransaction));
router.post('/', createValidation, asyncHandler(transactionController.createTransaction));
router.patch('/:id', asyncHandler(transactionController.updateTransaction));
router.delete('/:id', asyncHandler(transactionController.deleteTransaction));

export default router;
