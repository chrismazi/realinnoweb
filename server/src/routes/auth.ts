/**
 * Authentication Routes
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import * as authController from '../controllers/authController.js';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/register', registerValidation, asyncHandler(authController.register));
router.post('/login', loginValidation, asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/logout', asyncHandler(authController.logout));

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser));
router.patch('/profile', authenticate, asyncHandler(authController.updateProfile));
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], asyncHandler(authController.changePassword));

export default router;
