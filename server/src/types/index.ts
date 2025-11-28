/**
 * Type Definitions
 * Shared types for the API
 */

import { Request } from 'express';

// Extend Express Request with user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Auth types
export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

// Transaction types
export interface CreateTransactionInput {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  icon?: string;
  color?: string;
  date?: Date;
  isRecurring?: boolean;
  notes?: string;
}

export interface UpdateTransactionInput {
  title?: string;
  amount?: number;
  type?: 'income' | 'expense';
  category?: string;
  icon?: string;
  color?: string;
  date?: Date;
  isRecurring?: boolean;
  notes?: string;
}

// Savings Goal types
export interface CreateSavingsGoalInput {
  name: string;
  target: number;
  current?: number;
  color?: string;
  icon?: string;
  deadline?: Date;
}

export interface UpdateSavingsGoalInput {
  name?: string;
  target?: number;
  current?: number;
  color?: string;
  icon?: string;
  deadline?: Date;
  isActive?: boolean;
}

// Health types
export interface UpdateHealthDataInput {
  cycleDay?: number;
  lastPeriodDate?: Date;
  cycleLength?: number;
  vitalityScore?: number;
  sleepQuality?: number;
  exerciseFreq?: number;
  stressLevel?: number;
  nutritionScore?: number;
}

export interface CreateMoodLogInput {
  level: number;
  note?: string;
  factors?: string[];
}

export interface CreateJournalEntryInput {
  content: string;
  mood?: string;
  tags?: string[];
}

// Query params
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface TransactionQuery extends PaginationQuery {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
