/**
 * Supabase Client Configuration
 * Professional-grade setup with security best practices
 */

import { createClient, SupabaseClient, AuthError, Session, User } from '@supabase/supabase-js';

// Validation for required environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.'
    );
}

/**
 * Supabase client instance with optimized configuration
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'wellvest-auth',
        flowType: 'pkce', // More secure PKCE flow
    },
    global: {
        headers: {
            'X-Client-Info': 'wellvest-web@2.0.0',
        },
    },
});

/**
 * Database Types (generated from Supabase schema)
 * Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
 */
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    phone: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name: string;
                    phone?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    phone?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    category: string;
                    amount: number;
                    date: string;
                    type: 'income' | 'expense';
                    icon: string;
                    color: string;
                    is_recurring: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    category: string;
                    amount: number;
                    date: string;
                    type: 'income' | 'expense';
                    icon: string;
                    color: string;
                    is_recurring?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    category?: string;
                    amount?: number;
                    date?: string;
                    type?: 'income' | 'expense';
                    icon?: string;
                    color?: string;
                    is_recurring?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            savings_goals: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    current: number;
                    target: number;
                    color: string;
                    icon: string;
                    deadline: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    current?: number;
                    target: number;
                    color: string;
                    icon: string;
                    deadline?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    current?: number;
                    target?: number;
                    color?: string;
                    icon?: string;
                    deadline?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            health_data: {
                Row: {
                    id: string;
                    user_id: string;
                    data_type: string;
                    data: any;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    data_type: string;
                    data: any;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    data_type?: string;
                    data?: any;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}

// Helper type for typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Auth helper functions
 */
export const authHelpers = {
    /**
     * Get current session
     */
    async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
        const { data, error } = await supabase.auth.getSession();
        return { session: data.session, error };
    },

    /**
     * Get current user
     */
    async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
        const { data, error } = await supabase.auth.getUser();
        return { user: data.user, error };
    },

    /**
     * Sign out current user
     */
    async signOut(): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback: (session: Session | null) => void) {
        return supabase.auth.onAuthStateChange((_event, session) => {
            callback(session);
        });
    },
};

export default supabase;
