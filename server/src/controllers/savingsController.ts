/**
 * Savings Goals Controller
 * CRUD operations for savings goals
 */

import { Response } from 'express';
import prisma from '../config/database.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import type { 
  AuthRequest, 
  ApiResponse,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput 
} from '../types/index.js';

// Get all savings goals
export const getSavingsGoals = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: goals,
  });
};

// Get single savings goal
export const getSavingsGoal = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { id } = req.params;

  const goal = await prisma.savingsGoal.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!goal) {
    throw NotFoundError('Savings goal');
  }

  res.json({
    success: true,
    data: goal,
  });
};

// Create savings goal
export const createSavingsGoal = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const input: CreateSavingsGoalInput = req.body;

  const goal = await prisma.savingsGoal.create({
    data: {
      ...input,
      userId: req.user!.id,
      deadline: input.deadline ? new Date(input.deadline) : null,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Savings goal created',
    data: goal,
  });
};

// Update savings goal
export const updateSavingsGoal = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { id } = req.params;
  const input: UpdateSavingsGoalInput = req.body;

  const existing = await prisma.savingsGoal.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!existing) {
    throw NotFoundError('Savings goal');
  }

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      ...input,
      ...(input.deadline && { deadline: new Date(input.deadline) }),
    },
  });

  res.json({
    success: true,
    message: 'Savings goal updated',
    data: goal,
  });
};

// Delete savings goal
export const deleteSavingsGoal = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { id } = req.params;

  const existing = await prisma.savingsGoal.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!existing) {
    throw NotFoundError('Savings goal');
  }

  await prisma.savingsGoal.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Savings goal deleted',
  });
};

// Add contribution to goal
export const addContribution = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { id } = req.params;
  const { amount } = req.body;

  const existing = await prisma.savingsGoal.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!existing) {
    throw NotFoundError('Savings goal');
  }

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: {
      current: existing.current + amount,
    },
  });

  res.json({
    success: true,
    message: `Added $${amount} to ${goal.name}`,
    data: goal,
  });
};
