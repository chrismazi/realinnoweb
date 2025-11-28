
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  BUDGET = 'BUDGET',
  LEARN = 'LEARN',
  WELLNESS = 'WELLNESS',
  HEALTH = 'HEALTH',
  PROFILE = 'PROFILE'
}

export enum AuthState {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD'
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: Date;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isRecurring?: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  spent: number;
  limit: number; // For income, this might be "expected"
  color: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  imageUrl: string;
  content?: string;
}

export interface HealthTopic {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  fullContent: string;
  imageUrl: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  color: string;
  icon: string;
  deadline?: string;
}

export interface MoodLog {
  id: number;
  date: Date;
  level: number; // 1-5
  physical: string[];
  factors: string[];
  note: string;
}

export interface HealthData {
  id: string;
  date: Date;
  mood?: string;
  symptoms?: string[];
  notes?: string;
  // Dynamic properties for other health metrics
  [key: string]: any;
}
