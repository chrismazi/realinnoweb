/**
 * API Client for Backend Communication
 * Handles HTTP requests to the Express backend
 */

// @ts-ignore - Vite environment variable
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Load tokens from localStorage on init
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

// Token management
export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// HTTP request wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Handle token expiration
    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        return request<T>(endpoint, options);
      }
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
    };
  }
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// ============================================
// AUTH API
// ============================================
export const authClient = {
  async register(name: string, email: string, password: string) {
    const response = await request<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    );

    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  async login(email: string, password: string) {
    const response = await request<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  async logout() {
    const response = await request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    clearTokens();
    return response;
  },

  async getCurrentUser() {
    return request('/auth/me');
  },

  async updateProfile(data: { name?: string; avatar?: string; phone?: string }) {
    return request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// ============================================
// TRANSACTIONS API
// ============================================
export const transactionsClient = {
  async getAll(params?: {
    type?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.set(key, String(value));
      });
    }
    const query = queryParams.toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return request(`/transactions/${id}`);
  },

  async create(data: {
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date?: string;
    isRecurring?: boolean;
    notes?: string;
  }) {
    return request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    isRecurring: boolean;
    notes: string;
  }>) {
    return request(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return request(`/transactions/${id}`, { method: 'DELETE' });
  },

  async getStats(period: 'week' | 'month' | 'year' = 'month') {
    return request(`/transactions/stats?period=${period}`);
  },
};

// ============================================
// SAVINGS API
// ============================================
export const savingsClient = {
  async getAll() {
    return request('/savings');
  },

  async getById(id: string) {
    return request(`/savings/${id}`);
  },

  async create(data: {
    name: string;
    target: number;
    current?: number;
    color?: string;
    deadline?: string;
  }) {
    return request('/savings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<{
    name: string;
    target: number;
    current: number;
    color: string;
    deadline: string;
    isActive: boolean;
  }>) {
    return request(`/savings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return request(`/savings/${id}`, { method: 'DELETE' });
  },

  async addContribution(id: string, amount: number) {
    return request(`/savings/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },
};

// ============================================
// HEALTH CHECK
// ============================================
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
};

// Export unified client
export const apiClient = {
  auth: authClient,
  transactions: transactionsClient,
  savings: savingsClient,
  healthCheck,
  setTokens,
  clearTokens,
  getAccessToken,
};

export default apiClient;
