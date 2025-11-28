/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */

import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../config/database.js';
import type { AuthRequest, ApiResponse } from '../types/index.js';

// Middleware to authenticate requests
export const authenticate = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, name: true },
        });
        
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch {
    next();
  }
};
