/**
 * Authentication Controller
 * Handles user registration, login, logout, and token refresh
 */

import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateTokenPair, verifyRefreshToken, getRefreshTokenExpiryDate } from '../utils/jwt.js';
import { ApiError, BadRequestError, UnauthorizedError } from '../middleware/errorHandler.js';
import type { AuthRequest, ApiResponse, LoginInput, RegisterInput } from '../types/index.js';

// Register new user
export const register = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { email, password, name }: RegisterInput = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new ApiError('Email already registered', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user with settings
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      settings: {
        create: {}, // Create with defaults
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const tokens = generateTokenPair(user.id, user.email);

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user,
      ...tokens,
    },
  });
};

// Login user
export const login = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { email, password }: LoginInput = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const tokens = generateTokenPair(user.id, user.email);

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      ...tokens,
    },
  });
};

// Refresh access token
export const refreshToken = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError('Refresh token required');
  }

  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Check if token exists and not revoked
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Revoke old refresh token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true },
  });

  // Generate new tokens
  const tokens = generateTokenPair(user.id, user.email);

  // Save new refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  res.json({
    success: true,
    data: tokens,
  });
};

// Logout user
export const logout = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Revoke the refresh token
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

// Get current user
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      createdAt: true,
      settings: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
};

// Update user profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { name, avatar, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name && { name }),
      ...(avatar && { avatar }),
      ...(phone && { phone }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
    },
  });

  res.json({
    success: true,
    message: 'Profile updated',
    data: user,
  });
};

// Change password
export const changePassword = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    throw new BadRequestError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Revoke all refresh tokens
  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { isRevoked: true },
  });

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
};
