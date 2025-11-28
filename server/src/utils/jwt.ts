/**
 * JWT Utility Functions
 * Token generation and verification
 */

import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import type { TokenPayload, AuthTokens } from '../types/index.js';

// Generate access token (short-lived)
export const generateAccessToken = (userId: string, email: string): string => {
  const payload: TokenPayload = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (userId: string, email: string): string => {
  const payload: TokenPayload = {
    userId,
    email,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

// Generate both tokens
export const generateTokenPair = (userId: string, email: string): AuthTokens => {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email),
  };
};

// Verify access token
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as TokenPayload;
    if (decoded.type !== 'access') return null;
    return decoded;
  } catch {
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
    if (decoded.type !== 'refresh') return null;
    return decoded;
  } catch {
    return null;
  }
};

// Get token expiration time in seconds
export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    return decoded?.exp ?? null;
  } catch {
    return null;
  }
};

// Calculate refresh token expiry date
export const getRefreshTokenExpiryDate = (): Date => {
  const days = parseInt(config.jwt.refreshExpiresIn.replace('d', ''), 10) || 7;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
};
