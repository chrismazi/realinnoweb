/**
 * Global State Management with Zustand
 * Provides centralized state management with Supabase integration
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Transaction, SavingsGoal, ChatMessage } from '../types';
import { settingsService } from '../services/storageService';
import supabaseTransactionsService from '../services/supabaseTransactions';
import supabaseSavingsService from '../services/supabaseSavings';
import supabaseHealthService from '../services/supabaseHealth';
import supabaseChatService from '../services/supabaseChat';
import supabaseAuthService from '../services/supabaseAuth';

// Define the store state interface
interface AppState {
  // User data
  user: {
    id: string | null;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    isAuthenticated: boolean;
  };

  // Financial data
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  balance: number;

  // Health data
  healthData: {
    cycleData: any;
    mentalHealth: any;
    contraception: any;
    mensHealth: any;
  };

  // Chat data
  chatHistory: ChatMessage[];

  // Settings
  settings: {
    darkMode: boolean;
    notifications: boolean;
    biometrics: boolean;
    language: string;
    currency: string;
  };

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  // User actions
  setUser: (user: Partial<AppState['user']>) => void;
  logout: () => void;

  // Transaction actions
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Savings goal actions
  addSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // Health data actions
  updateHealthData: (category: keyof AppState['healthData'], data: any) => Promise<void>;

  // Chat actions
  addChatMessage: (message: ChatMessage) => Promise<void>;
  clearChatHistory: () => Promise<void>;

  // Settings actions
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  toggleDarkMode: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Persistence actions
  syncWithSupabase: () => Promise<void>;
  loadFromStorage: () => void;
  clearAllData: () => void;
}

// Create the store with persistence
const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: {
          id: null,
          name: '',
          email: '',
          phone: '',
          avatar: '',
          isAuthenticated: false
        },

        transactions: [],
        savingsGoals: [],
        balance: 0,

        healthData: {
          cycleData: {},
          mentalHealth: {},
          contraception: {},
          mensHealth: {}
        },

        chatHistory: [],

        settings: {
          darkMode: false,
          notifications: true,
          biometrics: false,
          language: 'rw',
          currency: 'RWF'
        },

        isLoading: false,
        error: null,

        // User actions
        setUser: (userData) => set((state) => {
          state.user = { ...state.user, ...userData };
        }),

        logout: () => set((state) => {
          state.user = {
            id: null,
            name: '',
            email: '',
            phone: '',
            avatar: '',
            isAuthenticated: false
          };
          state.transactions = [];
          state.savingsGoals = [];
          state.chatHistory = [];
          state.healthData = {
            cycleData: {},
            mentalHealth: {},
            contraception: {},
            mensHealth: {}
          };
          state.balance = 0;
        }),

        // Transaction actions
        addTransaction: async (transaction) => {
          // Optimistic update
          set((state) => {
            state.transactions.push(transaction);
            if (transaction.type === 'income') {
              state.balance += transaction.amount;
            } else {
              state.balance -= transaction.amount;
            }
          });

          // Sync with Supabase
          try {
            const result = await supabaseTransactionsService.add({
              title: transaction.title,
              category: transaction.category,
              amount: transaction.amount,
              date: transaction.date,
              type: transaction.type,
              icon: transaction.icon,
              color: transaction.color,
              is_recurring: transaction.isRecurring
            });

            if (!result.success) {
              console.error('Failed to sync transaction:', result.error);
              // TODO: Handle rollback or retry queue
            } else if (result.data) {
              // Update with real ID from database
              set((state) => {
                const index = state.transactions.findIndex(t => t.id === transaction.id);
                if (index !== -1) {
                  state.transactions[index].id = result.data!.id;
                }
              });
            }
          } catch (error) {
            console.error('Error syncing transaction:', error);
          }
        },

        updateTransaction: async (id, updates) => {
          // Optimistic update
          set((state) => {
            const index = state.transactions.findIndex(t => t.id === id);
            if (index !== -1) {
              const oldTransaction = state.transactions[index];
              state.transactions[index] = { ...oldTransaction, ...updates };

              // Update balance if amount changed
              if (updates.amount !== undefined || updates.type !== undefined) {
                if (oldTransaction.type === 'income') {
                  state.balance -= oldTransaction.amount;
                } else {
                  state.balance += oldTransaction.amount;
                }

                const newTransaction = state.transactions[index];
                if (newTransaction.type === 'income') {
                  state.balance += newTransaction.amount;
                } else {
                  state.balance -= newTransaction.amount;
                }
              }
            }
          });

          // Sync with Supabase
          try {
            await supabaseTransactionsService.update(id, {
              title: updates.title,
              category: updates.category,
              amount: updates.amount,
              date: updates.date,
              type: updates.type,
              icon: updates.icon,
              color: updates.color,
              is_recurring: updates.isRecurring
            });
          } catch (error) {
            console.error('Error syncing transaction update:', error);
          }
        },

        deleteTransaction: async (id) => {
          // Optimistic update
          set((state) => {
            const transaction = state.transactions.find(t => t.id === id);
            if (transaction) {
              if (transaction.type === 'income') {
                state.balance -= transaction.amount;
              } else {
                state.balance += transaction.amount;
              }
              state.transactions = state.transactions.filter(t => t.id !== id);
            }
          });

          // Sync with Supabase
          try {
            await supabaseTransactionsService.delete(id);
          } catch (error) {
            console.error('Error syncing transaction deletion:', error);
          }
        },

        // Savings goal actions
        addSavingsGoal: async (goal) => {
          // Optimistic update
          set((state) => {
            state.savingsGoals.push(goal);
          });

          // Sync with Supabase
          try {
            const result = await supabaseSavingsService.add({
              name: goal.name,
              target: goal.target,
              current: goal.current,
              color: goal.color,
              icon: goal.icon,
              deadline: goal.deadline
            });

            if (result.success && result.data) {
              // Update with real ID
              set((state) => {
                const index = state.savingsGoals.findIndex(g => g.id === goal.id);
                if (index !== -1) {
                  state.savingsGoals[index].id = result.data!.id;
                }
              });
            }
          } catch (error) {
            console.error('Error syncing savings goal:', error);
          }
        },

        updateSavingsGoal: async (id, updates) => {
          // Optimistic update
          set((state) => {
            const index = state.savingsGoals.findIndex(g => g.id === id);
            if (index !== -1) {
              state.savingsGoals[index] = { ...state.savingsGoals[index], ...updates };
            }
          });

          // Sync with Supabase
          try {
            await supabaseSavingsService.update(id, {
              name: updates.name,
              target: updates.target,
              current: updates.current,
              color: updates.color,
              icon: updates.icon,
              deadline: updates.deadline
            });
          } catch (error) {
            console.error('Error syncing savings goal update:', error);
          }
        },

        deleteSavingsGoal: async (id) => {
          // Optimistic update
          set((state) => {
            state.savingsGoals = state.savingsGoals.filter(g => g.id !== id);
          });

          // Sync with Supabase
          try {
            await supabaseSavingsService.delete(id);
          } catch (error) {
            console.error('Error syncing savings goal deletion:', error);
          }
        },

        // Health data actions
        updateHealthData: async (category, data) => {
          // Optimistic update
          set((state) => {
            state.healthData[category] = { ...state.healthData[category], ...data };
          });

          // Sync with Supabase
          try {
            // Map category to HealthDataType
            let dataType: any = category;
            if (category === 'cycleData') dataType = 'cycle';

            await supabaseHealthService.add(dataType, data);
          } catch (error) {
            console.error('Error syncing health data:', error);
          }
        },

        // Chat actions
        addChatMessage: async (message) => {
          // Optimistic update
          set((state) => {
            state.chatHistory.push(message);
            if (state.chatHistory.length > 100) {
              state.chatHistory = state.chatHistory.slice(-100);
            }
          });

          // Sync with Supabase
          try {
            const result = await supabaseChatService.add({
              role: message.role,
              text: message.text
            });

            if (result.success && result.data) {
              // Update with real ID
              set((state) => {
                const index = state.chatHistory.findIndex(m => m.id === message.id);
                if (index !== -1) {
                  state.chatHistory[index].id = result.data!.id;
                }
              });
            }
          } catch (error) {
            console.error('Error syncing chat message:', error);
          }
        },

        clearChatHistory: async () => {
          set((state) => {
            state.chatHistory = [];
          });

          try {
            await supabaseChatService.clearAll();
          } catch (error) {
            console.error('Error clearing chat history:', error);
          }
        },

        // Settings actions
        updateSettings: (newSettings) => set((state) => {
          state.settings = { ...state.settings, ...newSettings };
          settingsService.save(state.settings);

          if (newSettings.darkMode !== undefined) {
            if (newSettings.darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }

          // Sync to Supabase
          const user = state.user;
          if (user.id) {
            supabaseAuthService.updateProfile(user.id, { settings: state.settings })
              .catch(err => console.error('Failed to sync settings:', err));
          }
        }),

        toggleDarkMode: () => set((state) => {
          state.settings.darkMode = !state.settings.darkMode;

          if (state.settings.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }

          settingsService.save(state.settings);

          // Sync to Supabase
          const user = state.user;
          if (user.id) {
            supabaseAuthService.updateProfile(user.id, { settings: state.settings })
              .catch(err => console.error('Failed to sync settings:', err));
          }
        }),

        // Utility actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),

        setError: (error) => set((state) => {
          state.error = error;
        }),

        clearError: () => set((state) => {
          state.error = null;
        }),

        // Persistence actions
        syncWithSupabase: async () => {
          set({ isLoading: true });
          try {
            // Fetch all data in parallel
            const [transactions, savings, health, chat, userResult] = await Promise.all([
              supabaseTransactionsService.getAll(),
              supabaseSavingsService.getAll(),
              supabaseHealthService.getAll(),
              supabaseChatService.getAll(),
              supabaseAuthService.getCurrentUser()
            ]);

            set((state) => {
              if (transactions.success && transactions.data) {
                state.transactions = transactions.data;
                // Recalculate balance
                state.balance = transactions.data.reduce((acc, t) => {
                  return t.type === 'income' ? acc + t.amount : acc - t.amount;
                }, 0);
              }

              if (savings.success && savings.data) {
                state.savingsGoals = savings.data;
              }

              if (health.success && health.data) {
                // Reconstruct health data object
                const newHealthData = {
                  cycleData: {},
                  mentalHealth: {},
                  contraception: {},
                  mensHealth: {}
                };

                health.data.forEach(entry => {
                  if (entry.data_type === 'cycle') newHealthData.cycleData = { ...newHealthData.cycleData, ...entry.data };
                  if (entry.data_type === 'mental_health') newHealthData.mentalHealth = { ...newHealthData.mentalHealth, ...entry.data };
                  if (entry.data_type === 'contraception') newHealthData.contraception = { ...newHealthData.contraception, ...entry.data };
                  if (entry.data_type === 'mens_health') newHealthData.mensHealth = { ...newHealthData.mensHealth, ...entry.data };
                });

                state.healthData = newHealthData;
              }

              if (chat.success && chat.data) {
                state.chatHistory = chat.data;
              }

              if (userResult.success && userResult.data && userResult.data.profile.settings) {
                const remoteSettings = userResult.data.profile.settings;
                // Merge remote settings, prioritizing remote if not empty
                if (Object.keys(remoteSettings).length > 0) {
                  state.settings = { ...state.settings, ...remoteSettings };

                  // Apply dark mode immediately
                  if (state.settings.darkMode) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  // Also save to local storage
                  settingsService.save(state.settings);
                }
              }

              state.isLoading = false;
            });
          } catch (error) {
            console.error('Sync failed:', error);
            set({ isLoading: false, error: 'Failed to sync data' });
          }
        },

        loadFromStorage: () => set((state) => {
          // This is now mostly handled by persist middleware
          // But we can use this to trigger initial sync

          // Load settings from local storage service (legacy support)
          const loadedSettings = settingsService.load() as any;
          if (loadedSettings && typeof loadedSettings === 'object') {
            state.settings = {
              darkMode: loadedSettings.darkMode ?? false,
              notifications: loadedSettings.notifications ?? true,
              biometrics: loadedSettings.biometrics ?? false,
              // Force Kinyarwanda for all users (migration)
              language: 'rw',
              currency: loadedSettings.currency === 'USD' ? 'RWF' : loadedSettings.currency
            };
          } else {
            // New users - ensure Kinyarwanda is set
            state.settings.language = 'rw';
            state.settings.currency = 'RWF';
          }

          // Apply settings
          if (state.settings.darkMode) {
            document.documentElement.classList.add('dark');
          }
        }),

        clearAllData: () => set((state) => {
          state.user = {
            id: null,
            name: '',
            email: '',
            phone: '',
            avatar: '',
            isAuthenticated: false
          };
          state.transactions = [];
          state.savingsGoals = [];
          state.chatHistory = [];
          state.healthData = {
            cycleData: {},
            mentalHealth: {},
            contraception: {},
            mensHealth: {}
          };
          state.balance = 0;
          localStorage.clear();
        })
      })),
      {
        name: 'wellvest-storage',
        partialize: (state) => ({
          user: state.user,
          transactions: state.transactions,
          savingsGoals: state.savingsGoals,
          healthData: state.healthData,
          settings: state.settings
        })
      }
    )
  )
);

// Helper hooks
export const useUser = () => useAppStore((state) => state.user);
export const useTransactions = () => useAppStore((state) => state.transactions);
export const useSavingsGoals = () => useAppStore((state) => state.savingsGoals);
export const useHealthData = () => useAppStore((state) => state.healthData);
export const useChatHistory = () => useAppStore((state) => state.chatHistory);
export const useSettings = () => useAppStore((state) => state.settings);
export const useBalance = () => useAppStore((state) => state.balance);

export default useAppStore;
