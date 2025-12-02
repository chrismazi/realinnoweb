/**
 * Local Storage Service with encryption for sensitive data
 * This provides data persistence across sessions
 */

import { SavingsGoal, Transaction, ChatMessage } from '../types';

// Encryption key (in production, this should be derived from user password)
const STORAGE_KEY_PREFIX = 'realworks_';
const ENCRYPTION_KEY = 'temp_encryption_key'; // TODO: Replace with proper key derivation

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: `${STORAGE_KEY_PREFIX}user_profile`,
  TRANSACTIONS: `${STORAGE_KEY_PREFIX}transactions`,
  SAVINGS_GOALS: `${STORAGE_KEY_PREFIX}savings_goals`,
  CHAT_HISTORY: `${STORAGE_KEY_PREFIX}chat_history`,
  HEALTH_DATA: `${STORAGE_KEY_PREFIX}health_data`,
  MENTAL_HEALTH: `${STORAGE_KEY_PREFIX}mental_health`,
  SETTINGS: `${STORAGE_KEY_PREFIX}settings`,
  AUTH_TOKEN: `${STORAGE_KEY_PREFIX}auth_token`,
  REFRESH_TOKEN: `${STORAGE_KEY_PREFIX}refresh_token`,
} as const;

// Simple XOR encryption for demo (replace with proper encryption in production)
const encrypt = (text: string): string => {
  if (!text) return '';
  return btoa(text); // Base64 encoding for now
};

const decrypt = (encrypted: string): string => {
  if (!encrypted) return '';
  try {
    return atob(encrypted);
  } catch {
    return '';
  }
};

// Generic storage functions with error handling
export const storageService = {
  // Save data with optional encryption
  save: <T>(key: string, data: T, shouldEncrypt: boolean = false): boolean => {
    try {
      const stringData = JSON.stringify(data);
      const dataToStore = shouldEncrypt ? encrypt(stringData) : stringData;
      localStorage.setItem(key, dataToStore);
      return true;
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      return false;
    }
  },

  // Load data with optional decryption
  load: <T>(key: string, shouldDecrypt: boolean = false): T | null => {
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) return null;

      const stringData = shouldDecrypt ? decrypt(storedData) : storedData;
      return JSON.parse(stringData) as T;
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return null;
    }
  },

  // Remove specific key
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  },

  // Clear all app data
  clearAll: (): boolean => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  },

  // Check if storage is available
  isAvailable: (): boolean => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Get storage size
  getSize: (): number => {
    let size = 0;
    for (const key in localStorage) {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  }
};

// Specific data services
export const userProfileService = {
  save: (profile: any) => storageService.save(STORAGE_KEYS.USER_PROFILE, profile, true),
  load: () => storageService.load(STORAGE_KEYS.USER_PROFILE, true),
  clear: () => storageService.remove(STORAGE_KEYS.USER_PROFILE)
};

export const transactionService = {
  save: (transactions: Transaction[]) =>
    storageService.save(STORAGE_KEYS.TRANSACTIONS, transactions),
  load: (): Transaction[] =>
    storageService.load<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [],
  add: (transaction: Transaction): boolean => {
    const transactions = transactionService.load();
    transactions.push(transaction);
    return transactionService.save(transactions);
  },
  update: (id: string, updates: Partial<Transaction>): boolean => {
    const transactions = transactionService.load();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return false;
    transactions[index] = { ...transactions[index], ...updates };
    return transactionService.save(transactions);
  },
  delete: (id: string): boolean => {
    const transactions = transactionService.load();
    const filtered = transactions.filter(t => t.id !== id);
    return transactionService.save(filtered);
  }
};

export const savingsGoalService = {
  save: (goals: SavingsGoal[]) =>
    storageService.save(STORAGE_KEYS.SAVINGS_GOALS, goals),
  load: (): SavingsGoal[] =>
    storageService.load<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS) || [],
  update: (id: string, updates: Partial<SavingsGoal>): boolean => {
    const goals = savingsGoalService.load();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return false;
    goals[index] = { ...goals[index], ...updates };
    return savingsGoalService.save(goals);
  }
};

export const chatHistoryService = {
  save: (messages: ChatMessage[]) =>
    storageService.save(STORAGE_KEYS.CHAT_HISTORY, messages, true),
  load: (): ChatMessage[] =>
    storageService.load<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY, true) || [],
  add: (message: ChatMessage): boolean => {
    const messages = chatHistoryService.load();
    messages.push(message);
    // Keep only last 100 messages to prevent storage bloat
    const trimmed = messages.slice(-100);
    return chatHistoryService.save(trimmed);
  },
  clear: () => storageService.remove(STORAGE_KEYS.CHAT_HISTORY)
};

export const healthDataService = {
  save: (data: any) =>
    storageService.save(STORAGE_KEYS.HEALTH_DATA, data, true),
  load: () =>
    storageService.load(STORAGE_KEYS.HEALTH_DATA, true) || {},
  update: (updates: any): boolean => {
    const current = healthDataService.load() || {};
    const updated = Object.assign({}, current, updates, { lastUpdated: new Date().toISOString() });
    return healthDataService.save(updated);
  }
};

export const settingsService = {
  save: (settings: any) =>
    storageService.save(STORAGE_KEYS.SETTINGS, settings),
  load: () =>
    storageService.load(STORAGE_KEYS.SETTINGS) || {
      darkMode: false,
      notifications: true,
      biometrics: false,
      language: 'en',
      currency: 'USD'
    },
  update: (key: string, value: any): boolean => {
    const settings = settingsService.load();
    settings[key] = value;
    return settingsService.save(settings);
  }
};

// Session management
export const sessionService = {
  setTokens: (authToken: string, refreshToken: string) => {
    storageService.save(STORAGE_KEYS.AUTH_TOKEN, authToken, true);
    storageService.save(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, true);
  },
  getAuthToken: (): string | null =>
    storageService.load<string>(STORAGE_KEYS.AUTH_TOKEN, true),
  getRefreshToken: (): string | null =>
    storageService.load<string>(STORAGE_KEYS.REFRESH_TOKEN, true),
  clearTokens: () => {
    storageService.remove(STORAGE_KEYS.AUTH_TOKEN);
    storageService.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },
  isAuthenticated: (): boolean => {
    const token = sessionService.getAuthToken();
    if (!token) return false;

    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
};

// Export all services
export default {
  storage: storageService,
  userProfile: userProfileService,
  transactions: transactionService,
  savingsGoals: savingsGoalService,
  chatHistory: chatHistoryService,
  healthData: healthDataService,
  settings: settingsService,
  session: sessionService
};
