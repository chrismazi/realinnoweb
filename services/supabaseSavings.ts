/**
 * Supabase Savings Goals Service
 * Handles all savings goal operations with progress tracking
 */

import { supabase } from '../lib/supabase';
import type { SavingsGoal } from '../types';

export interface SavingsGoalInsert {
    name: string;
    target: number;
    current?: number;
    color: string;
    icon: string;
    deadline?: string | null;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Savings Goals Service
 */
export const supabaseSavingsService = {
    /**
     * Get all savings goals for current user
     */
    async getAll(): Promise<ServiceResponse<SavingsGoal[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('savings_goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Get savings goals error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            // Transform database format to app format
            const goals: SavingsGoal[] = (data || []).map(g => ({
                id: g.id,
                name: g.name,
                current: parseFloat(g.current.toString()),
                target: parseFloat(g.target.toString()),
                color: g.color,
                icon: g.icon,
                deadline: g.deadline || undefined,
            }));

            return {
                success: true,
                data: goals,
            };
        } catch (error: any) {
            console.error('Get savings goals exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch savings goals',
            };
        }
    },

    /**
     * Add a new savings goal
     */
    async add(goal: SavingsGoalInsert): Promise<ServiceResponse<SavingsGoal>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            // Validate inputs
            if (!goal.name || goal.name.trim().length === 0) {
                return {
                    success: false,
                    error: 'Goal name is required',
                };
            }

            if (!goal.target || goal.target <= 0) {
                return {
                    success: false,
                    error: 'Target amount must be greater than 0',
                };
            }

            const { data, error } = await supabase
                .from('savings_goals')
                .insert({
                    user_id: user.id,
                    name: goal.name,
                    current: goal.current || 0,
                    target: goal.target,
                    color: goal.color,
                    icon: goal.icon,
                    deadline: goal.deadline || null,
                })
                .select()
                .single();

            if (error) {
                console.error('Add savings goal error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            // Transform to app format
            const newGoal: SavingsGoal = {
                id: data.id,
                name: data.name,
                current: parseFloat(data.current.toString()),
                target: parseFloat(data.target.toString()),
                color: data.color,
                icon: data.icon,
                deadline: data.deadline || undefined,
            };

            return {
                success: true,
                data: newGoal,
            };
        } catch (error: any) {
            console.error('Add savings goal exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to add savings goal',
            };
        }
    },

    /**
     * Update an existing savings goal
     */
    async update(id: string, updates: Partial<SavingsGoalInsert>): Promise<ServiceResponse<SavingsGoal>> {
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
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.current !== undefined) updateData.current = updates.current;
            if (updates.target !== undefined) updateData.target = updates.target;
            if (updates.color !== undefined) updateData.color = updates.color;
            if (updates.icon !== undefined) updateData.icon = updates.icon;
            if (updates.deadline !== undefined) updateData.deadline = updates.deadline;

            const { data, error } = await supabase
                .from('savings_goals')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', user.id) // Ensure user owns this goal
                .select()
                .single();

            if (error) {
                console.error('Update savings goal error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            if (!data) {
                return {
                    success: false,
                    error: 'Savings goal not found or access denied',
                };
            }

            const updatedGoal: SavingsGoal = {
                id: data.id,
                name: data.name,
                current: parseFloat(data.current.toString()),
                target: parseFloat(data.target.toString()),
                color: data.color,
                icon: data.icon,
                deadline: data.deadline || undefined,
            };

            return {
                success: true,
                data: updatedGoal,
            };
        } catch (error: any) {
            console.error('Update savings goal exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to update savings goal',
            };
        }
    },

    /**
     * Add to a savings goal (update progress)
     */
    async addProgress(id: string, amount: number): Promise<ServiceResponse<SavingsGoal>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            if (amount <= 0) {
                return {
                    success: false,
                    error: 'Amount must be greater than 0',
                };
            }

            // First, get current value
            const { data: currentGoal, error: fetchError } = await supabase
                .from('savings_goals')
                .select('current, target')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (fetchError || !currentGoal) {
                return {
                    success: false,
                    error: 'Savings goal not found',
                };
            }

            const newCurrent = parseFloat(currentGoal.current.toString()) + amount;
            const target = parseFloat(currentGoal.target.toString());

            // Don't allow exceeding target
            const finalCurrent = Math.min(newCurrent, target);

            // Update with new amount
            const { data, error } = await supabase
                .from('savings_goals')
                .update({ current: finalCurrent })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) {
                console.error('Add progress error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const updatedGoal: SavingsGoal = {
                id: data.id,
                name: data.name,
                current: parseFloat(data.current.toString()),
                target: parseFloat(data.target.toString()),
                color: data.color,
                icon: data.icon,
                deadline: data.deadline || undefined,
            };

            return {
                success: true,
                data: updatedGoal,
            };
        } catch (error: any) {
            console.error('Add progress exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to update progress',
            };
        }
    },

    /**
     * Delete a savings goal
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
                .from('savings_goals')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Ensure user owns this goal

            if (error) {
                console.error('Delete savings goal error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Delete savings goal exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete savings goal',
            };
        }
    },

    /**
     * Get goals near completion (>= 80%)
     */
    async getNearCompletion(): Promise<ServiceResponse<SavingsGoal[]>> {
        try {
            const allGoals = await this.getAll();

            if (!allGoals.success || !allGoals.data) {
                return allGoals;
            }

            const nearCompletion = allGoals.data.filter(goal => {
                const progress = (goal.current / goal.target) * 100;
                return progress >= 80 && progress < 100;
            });

            return {
                success: true,
                data: nearCompletion,
            };
        } catch (error: any) {
            console.error('Get near completion exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch goals',
            };
        }
    },

    /**
     * Get completed goals
     */
    async getCompleted(): Promise<ServiceResponse<SavingsGoal[]>> {
        try {
            const allGoals = await this.getAll();

            if (!allGoals.success || !allGoals.data) {
                return allGoals;
            }

            const completed = allGoals.data.filter(goal => goal.current >= goal.target);

            return {
                success: true,
                data: completed,
            };
        } catch (error: any) {
            console.error('Get completed exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch goals',
            };
        }
    },

    /**
     * Subscribe to real-time savings goal changes
     */
    subscribeToChanges(callback: (payload: any) => void) {
        return supabase
            .channel('savings_goals_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'savings_goals',
                },
                callback
            )
            .subscribe();
    },
};

export default supabaseSavingsService;
