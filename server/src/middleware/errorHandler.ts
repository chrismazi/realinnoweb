/**
 * Error Handling Middleware
 * Centralized error handling for the API
 */

import { Request, Response, NextFunction } from 'express';
import config from '../config/index.js';
import type { ApiResponse } from '../types/index.js';

// Custom API Error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common errors
export const NotFoundError = (resource: string = 'Resource') => 
  new ApiError(`${resource} not found`, 404);

export const UnauthorizedError = (message: string = 'Unauthorized') => 
  new ApiError(message, 401);

export const ForbiddenError = (message: string = 'Forbidden') => 
  new ApiError(message, 403);

export const BadRequestError = (message: string = 'Bad request') => 
  new ApiError(message, 400);

export const ConflictError = (message: string = 'Conflict') => 
  new ApiError(message, 409);

// Error handler middleware
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let stack: string | undefined;

  // Handle ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Include stack trace in development
  if (config.isDev) {
    stack = err.stack;
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(stack && { stack }),
  });
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response<ApiResponse>
): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};

// Async handler wrapper to catch async errors
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
