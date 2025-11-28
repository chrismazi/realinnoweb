/**
 * Supabase Health Data Service
 * Handles all health-related data with flexible JSONB storage
 */

import { supabase } from '../lib/supabase';

export type HealthDataType = 'cycle' | 'mental_health' | 'contraception' | 'mens_health' | 'journal' | 'mood';

export interface HealthDataEntry {
    id: string;
    data_type: HealthDataType;
    data: any; // Flexible JSON data
    created_at: string;
    updated_at: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Health Data Service
 */
export const supabaseHealthService = {
    /**
     * Get all health data for current user
     */
    async getAll(): Promise<ServiceResponse<HealthDataEntry[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('health_data')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Get health data error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
                data: data || [],
            };
        } catch (error: any) {
            console.error('Get health data exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch health data',
            };
        }
    },

    /**
     * Get health data by type
     */
    async getByType(dataType: HealthDataType): Promise<ServiceResponse<HealthDataEntry[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('health_data')
                .select('*')
                .eq('user_id', user.id)
                .eq('data_type', dataType)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Get health data by type error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
                data: data || [],
            };
        } catch (error: any) {
            console.error('Get health data by type exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch health data',
            };
        }
    },

    /**
     * Add new health data entry
     */
    async add(dataType: HealthDataType, data: any): Promise<ServiceResponse<HealthDataEntry>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data: newEntry, error } = await supabase
                .from('health_data')
                .insert({
                    user_id: user.id,
                    data_type: dataType,
                    data: data,
                })
                .select()
                .single();

            if (error) {
                console.error('Add health data error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
                data: newEntry,
            };
        } catch (error: any) {
            console.error('Add health data exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to add health data',
            };
        }
    },

    /**
     * Update health data entry
     */
    async update(id: string, data: any): Promise<ServiceResponse<HealthDataEntry>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data: updatedEntry, error } = await supabase
                .from('health_data')
                .update({ data })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) {
                console.error('Update health data error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            if (!updatedEntry) {
                return {
                    success: false,
                    error: 'Health data not found or access denied',
                };
            }

            return {
                success: true,
                data: updatedEntry,
            };
        } catch (error: any) {
            console.error('Update health data exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to update health data',
            };
        }
    },

    /**
     * Delete health data entry
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
                .from('health_data')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) {
                console.error('Delete health data error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Delete health data exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete health data',
            };
        }
    },

    /**
     * Get latest entry of a specific type
     */
    async getLatest(dataType: HealthDataType): Promise<ServiceResponse<HealthDataEntry | null>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('health_data')
                .select('*')
                .eq('user_id', user.id)
                .eq('data_type', dataType)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Get latest health data error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
                data: data || null,
            };
        } catch (error: any) {
            console.error('Get latest health data exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch latest health data',
            };
        }
    },

    /**
     * Get health data entries within date range
     */
    async getByDateRange(
        dataType: HealthDataType,
        startDate: string,
        endDate: string
    ): Promise<ServiceResponse<HealthDataEntry[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('health_data')
                .select('*')
                .eq('user_id', user.id)
                .eq('data_type', dataType)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Get health data by date range error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
                data: data || [],
            };
        } catch (error: any) {
            console.error('Get health data by date range exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch health data',
            };
        }
    },

    /**
     * Subscribe to real-time health data changes
     */
    subscribeToChanges(callback: (payload: any) => void) {
        return supabase
            .channel('health_data_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'health_data',
                },
                callback
            )
            .subscribe();
    },

    /**
     * Specialized: Save cycle tracking data
     */
    async saveCycleData(cycleData: {
        lastPeriodDate: string;
        cycleLength: number;
        periodLength: number;
        symptoms?: string[];
    }): Promise<ServiceResponse<HealthDataEntry>> {
        return this.add('cycle', cycleData);
    },

    /**
     * Specialized: Save mood/mental health entry
     */
    async saveMoodEntry(moodData: {
        mood: string;
        intensity: number;
        notes?: string;
        timestamp: string;
    }): Promise<ServiceResponse<HealthDataEntry>> {
        return this.add('mood', moodData);
    },

    /**
     * Specialized: Save journal entry
     */
    async saveJournalEntry(journalData: {
        title?: string;
        content: string;
        mood?: string;
        tags?: string[];
        timestamp: string;
    }): Promise<ServiceResponse<HealthDataEntry>> {
        return this.add('journal', journalData);
    },

    /**
     * Specialized: Get all journal entries
     */
    async getAllJournalEntries(): Promise<ServiceResponse<HealthDataEntry[]>> {
        return this.getByType('journal');
    },

    /**
     * Specialized: Get all mood entries
     */
    async getAllMoodEntries(): Promise<ServiceResponse<HealthDataEntry[]>> {
        return this.getByType('mood');
    },
};

export default supabaseHealthService;
