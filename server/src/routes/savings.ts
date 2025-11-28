/**
 * Savings Goals Routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as savingsController from '../controllers/savingsController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation
const createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('target').isFloat({ min: 1 }).withMessage('Target amount required'),
];

// Routes
router.get('/', asyncHandler(savingsController.getSavingsGoals));
router.get('/:id', asyncHandler(savingsController.getSavingsGoal));
router.post('/', createValidation, asyncHandler(savingsController.createSavingsGoal));
router.patch('/:id', asyncHandler(savingsController.updateSavingsGoal));
router.delete('/:id', asyncHandler(savingsController.deleteSavingsGoal));
router.post('/:id/contribute', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount required'),
], asyncHandler(savingsController.addContribution));

export default router;
