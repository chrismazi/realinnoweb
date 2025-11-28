/**
 * Supabase Transactions Service
 * Handles all financial transaction operations with real-time sync
 */

import { supabase } from '../lib/supabase';
import type { Transaction } from '../types';

export interface TransactionInsert {
    title: string;
    category: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    is_recurring?: boolean;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Transactions Service
 */
export const supabaseTransactionsService = {
    /**
     * Get all transactions for current user
     */
    async getAll(): Promise<ServiceResponse<Transaction[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) {
                console.error('Get transactions error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            // Transform database format to app format
            const transactions: Transaction[] = (data || []).map(t => ({
                id: t.id,
                title: t.title,
                category: t.category,
                amount: parseFloat(t.amount.toString()),
                date: new Date(t.date),
                type: t.type as 'income' | 'expense',
                icon: t.icon,
                color: t.color,
                isRecurring: t.is_recurring,
            }));

            return {
                success: true,
                data: transactions,
            };
        } catch (error: any) {
            console.error('Get transactions exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch transactions',
            };
        }
    },

    /**
     * Add a new transaction
     */
    async add(transaction: Omit<TransactionInsert, 'date'> & { date: string | Date }): Promise<ServiceResponse<Transaction>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const dateStr = transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date;

            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    title: transaction.title,
                    category: transaction.category,
                    amount: transaction.amount,
                    date: dateStr,
                    type: transaction.type,
                    icon: transaction.icon,
                    color: transaction.color,
                    is_recurring: transaction.is_recurring || false,
                })
                .select()
                .single();

            if (error) {
                console.error('Add transaction error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            // Transform to app format
            const newTransaction: Transaction = {
                id: data.id,
                title: data.title,
                category: data.category,
                amount: parseFloat(data.amount.toString()),
                date: new Date(data.date),
                type: data.type as 'income' | 'expense',
                icon: data.icon,
                color: data.color,
                isRecurring: data.is_recurring,
            };

            return {
                success: true,
                data: newTransaction,
            };
        } catch (error: any) {
            console.error('Add transaction exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to add transaction',
            };
        }
    },

    /**
     * Update an existing transaction
     */
    async update(id: string, updates: Partial<Omit<TransactionInsert, 'date'> & { date: string | Date }>): Promise<ServiceResponse<Transaction>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            // Build update object
            const updateData: any = {};
            if (updates.title !== undefined) updateData.title = updates.title;
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.amount !== undefined) updateData.amount = updates.amount;
            if (updates.date !== undefined) {
                updateData.date = updates.date instanceof Date ? updates.date.toISOString() : updates.date;
            }
            if (updates.type !== undefined) updateData.type = updates.type;
            if (updates.icon !== undefined) updateData.icon = updates.icon;
            if (updates.color !== undefined) updateData.color = updates.color;
            if (updates.is_recurring !== undefined) updateData.is_recurring = updates.is_recurring;

            const { data, error } = await supabase
                .from('transactions')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', user.id) // Ensure user owns this transaction
                .select()
                .single();

            if (error) {
                console.error('Update transaction error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            if (!data) {
                return {
                    success: false,
                    error: 'Transaction not found or access denied',
                };
            }

            const updatedTransaction: Transaction = {
                id: data.id,
                title: data.title,
                category: data.category,
                amount: parseFloat(data.amount.toString()),
                date: new Date(data.date),
                type: data.type as 'income' | 'expense',
                icon: data.icon,
                color: data.color,
                isRecurring: data.is_recurring,
            };

            return {
                success: true,
                data: updatedTransaction,
            };
        } catch (error: any) {
            console.error('Update transaction exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to update transaction',
            };
        }
    },

    /**
     * Delete a transaction
     */
    async delete(id: string): Promise<ServiceResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Ensure user owns this transaction

            if (error) {
                console.error('Delete transaction error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Delete transaction exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete transaction',
            };
        }
    },

    /**
     * Get transactions by date range
     */
    async getByDateRange(startDate: string, endDate: string): Promise<ServiceResponse<Transaction[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (error) {
                console.error('Get transactions by date error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const transactions: Transaction[] = (data || []).map(t => ({
                id: t.id,
                title: t.title,
                category: t.category,
                amount: parseFloat(t.amount.toString()),
                date: new Date(t.date),
                type: t.type as 'income' | 'expense',
                icon: t.icon,
                color: t.color,
                isRecurring: t.is_recurring,
            }));

            return {
                success: true,
                data: transactions,
            };
        } catch (error: any) {
            console.error('Get transactions by date exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch transactions',
            };
        }
    },

    /**
     * Get transactions by type
     */
    async getByType(type: 'income' | 'expense'): Promise<ServiceResponse<Transaction[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .eq('type', type)
                .order('date', { ascending: false });

            if (error) {
                console.error('Get transactions by type error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const transactions: Transaction[] = (data || []).map(t => ({
                id: t.id,
                title: t.title,
                category: t.category,
                amount: parseFloat(t.amount.toString()),
                date: new Date(t.date),
                type: t.type as 'income' | 'expense',
                icon: t.icon,
                color: t.color,
                isRecurring: t.is_recurring,
            }));

            return {
                success: true,
                data: transactions,
            };
        } catch (error: any) {
            console.error('Get transactions by type exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch transactions',
            };
        }
    },

    /**
     * Subscribe to real-time transaction changes
     */
    subscribeToChanges(callback: (payload: any) => void) {
        return supabase
            .channel('transactions_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                },
                callback
            )
            .subscribe();
    },
};

export default supabaseTransactionsService;
