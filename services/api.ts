/**
 * Mock Backend API Service
 * Simulates a real REST API for development
 */

import { Transaction, SavingsGoal, ChatMessage } from '../types';
import { 
  transactionService, 
  savingsGoalService, 
  chatHistoryService, 
  healthDataService, 
  sessionService,
  settingsService
} from './storageService';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

const mockUsers = new Map<string, { user: User; password: string }>();
const mockSessions = new Map<string, string>();
const generateToken = () => 'tk_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

// AUTH API
export const authApi = {
  async register(data: { email: string; password: string; name: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(800);
    if (!data.email || !data.password || !data.name) return { success: false, error: 'All fields required' };
    
    const userId = 'user_' + Date.now();
    const user: User = { id: userId, email: data.email, name: data.name };
    mockUsers.set(userId, { user, password: data.password });
    
    const token = generateToken();
    mockSessions.set(token, userId);
    sessionService.setTokens(token, 'refresh_' + token);
    
    return { success: true, data: { user, token } };
  },

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(600);
    const userData = Array.from(mockUsers.values()).find(u => u.user.email === email);
    if (!userData || userData.password !== password) return { success: false, error: 'Invalid credentials' };
    
    const token = generateToken();
    mockSessions.set(token, userData.user.id);
    sessionService.setTokens(token, 'refresh_' + token);
    
    return { success: true, data: { user: userData.user, token } };
  },

  async logout(): Promise<ApiResponse<null>> {
    await delay(200);
    sessionService.clearTokens();
    return { success: true, message: 'Logged out' };
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(300);
    const token = sessionService.getAuthToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    const userId = mockSessions.get(token);
    const userData = userId ? mockUsers.get(userId) : null;
    if (!userData) return { success: false, error: 'User not found' };
    return { success: true, data: userData.user };
  },
};

// TRANSACTIONS API
export const transactionsApi = {
  async getAll(params?: { type?: string; search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    await delay(400);
    let transactions = transactionService.load();
    
    if (params?.type) transactions = transactions.filter(t => t.type === params.type);
    if (params?.search) {
      const s = params.search.toLowerCase();
      transactions = transactions.filter(t => t.title.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    
    return {
      success: true,
      data: transactions.slice(start, start + limit),
      total: transactions.length,
      page,
      limit,
      hasMore: start + limit < transactions.length,
    };
  },

  async create(data: Omit<Transaction, 'id'>): Promise<ApiResponse<Transaction>> {
    await delay(300);
    const transaction: Transaction = { ...data, id: 'tx_' + Date.now() };
    transactionService.add(transaction);
    return { success: true, data: transaction };
  },

  async update(id: string, updates: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    await delay(300);
    const transactions = transactionService.load();
    const existing = transactions.find(t => t.id === id);
    if (!existing) return { success: false, error: 'Not found' };
    const updated = { ...existing, ...updates };
    transactionService.update(id, updated);
    return { success: true, data: updated };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    transactionService.delete(id);
    return { success: true, message: 'Deleted' };
  },
};

// SAVINGS API
export const savingsApi = {
  async getAll(): Promise<ApiResponse<SavingsGoal[]>> {
    await delay(300);
    return { success: true, data: savingsGoalService.load() };
  },

  async create(data: Omit<SavingsGoal, 'id'>): Promise<ApiResponse<SavingsGoal>> {
    await delay(300);
    const goal: SavingsGoal = { ...data, id: 'goal_' + Date.now() };
    const goals = savingsGoalService.load();
    goals.push(goal);
    savingsGoalService.save(goals);
    return { success: true, data: goal };
  },

  async update(id: string, updates: Partial<SavingsGoal>): Promise<ApiResponse<SavingsGoal>> {
    await delay(300);
    const goals = savingsGoalService.load();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return { success: false, error: 'Not found' };
    const updated = { ...goals[index], ...updates };
    savingsGoalService.update(id, updated);
    return { success: true, data: updated };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    const goals = savingsGoalService.load().filter(g => g.id !== id);
    savingsGoalService.save(goals);
    return { success: true, message: 'Deleted' };
  },
};

// HEALTH API
export const healthApi = {
  async getData(): Promise<ApiResponse<any>> {
    await delay(300);
    return { success: true, data: healthDataService.load() };
  },

  async update(updates: any): Promise<ApiResponse<any>> {
    await delay(300);
    healthDataService.update(updates);
    return { success: true, data: healthDataService.load() };
  },

  async logMood(mood: { level: number; note?: string }): Promise<ApiResponse<any>> {
    await delay(200);
    const data = (healthDataService.load() || {}) as Record<string, any>;
    const moodHistory = Array.isArray(data.moodHistory) ? data.moodHistory : [];
    const entry = { id: Date.now(), date: new Date().toISOString(), ...mood };
    healthDataService.update({ ...data, moodHistory: [entry, ...moodHistory] });
    return { success: true, data: entry };
  },
};

// CHAT API
export const chatApi = {
  async getHistory(): Promise<ApiResponse<ChatMessage[]>> {
    await delay(200);
    return { success: true, data: chatHistoryService.load() };
  },

  async addMessage(message: ChatMessage): Promise<ApiResponse<ChatMessage>> {
    await delay(100);
    chatHistoryService.add(message);
    return { success: true, data: message };
  },

  async clearHistory(): Promise<ApiResponse<null>> {
    await delay(100);
    chatHistoryService.clear();
    return { success: true, message: 'Cleared' };
  },
};

// SETTINGS API
export const settingsApi = {
  async get(): Promise<ApiResponse<any>> {
    await delay(200);
    return { success: true, data: settingsService.load() };
  },

  async update(key: string, value: any): Promise<ApiResponse<any>> {
    await delay(200);
    settingsService.update(key, value);
    return { success: true, data: settingsService.load() };
  },
};

export const api = {
  auth: authApi,
  transactions: transactionsApi,
  savings: savingsApi,
  health: healthApi,
  chat: chatApi,
  settings: settingsApi,
};

export default api;