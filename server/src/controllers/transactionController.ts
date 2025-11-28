/**
 * Transaction Controller
 * CRUD operations for transactions
 */

import { Response } from 'express';
import prisma from '../config/database.js';
import { ApiError, NotFoundError } from '../middleware/errorHandler.js';
import type { 
  AuthRequest, 
  ApiResponse, 
  PaginatedResponse,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionQuery 
} from '../types/index.js';

// Get all transactions with pagination and filters
export const getTransactions = async (
  req: AuthRequest,
  res: Response<PaginatedResponse<any>>
): Promise<void> => {
  const {
    page = 1,
    limit = 20,
    type,
    category,
    startDate,
    endDate,
    search,
  } = req.query as TransactionQuery;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Build where clause
  const where: any = {
    userId: req.user!.id,
  };

  if (type) where.type = type;
  if (category) where.category = category;
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get transactions and count
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take,
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages,
      hasMore: Number(page) < totalPages,
    },
  });
};

// Get single transaction
export const getTransaction = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { id } = req.params;

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!transaction) {
    throw NotFoundError('Transaction');
  }

  res.json({
    success: true,
    data: transaction,
  });
};

// Create transaction
export const createTransaction = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const input: CreateTransactionInput = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      ...input,
      userId: req.user!.id,
      date: input.date ? new Date(input.date) : new Date(),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Transaction created',
    data: transaction,
  });
};

// Update transaction
export const updateTransaction = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { id } = req.params;
  const input: UpdateTransactionInput = req.body;

  // Check ownership
  const existing = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!existing) {
    throw NotFoundError('Transaction');
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...input,
      ...(input.date && { date: new Date(input.date) }),
    },
  });

  res.json({
    success: true,
    message: 'Transaction updated',
    data: transaction,
  });
};

// Delete transaction
export const deleteTransaction = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { id } = req.params;

  // Check ownership
  const existing = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!existing) {
    throw NotFoundError('Transaction');
  }

  await prisma.transaction.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Transaction deleted',
  });
};

// Get transaction statistics
export const getTransactionStats = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { period = 'month' } = req.query;
  
  let startDate: Date;
  const now = new Date();

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.user!.id,
      date: { gte: startDate },
    },
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      period,
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      topCategories,
    },
  });
};
