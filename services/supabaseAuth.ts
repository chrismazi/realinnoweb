/**
 * Supabase Authentication Service
 * Professional-grade auth implementation with comprehensive error handling
 */

import { supabase, authHelpers } from '../lib/supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends Error {
    constructor(
        message: string,
        public code?: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

/**
 * Auth response types
 */
export interface AuthResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}

export interface SignUpData {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    avatar_url?: string | null;
    settings?: any;
    created_at?: string;
    updated_at?: string;
}

/**
 * Email validation
 */
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Password strength validation
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
const isStrongPassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
};

/**
 * Convert Supabase AuthError to user-friendly message
 */
const getErrorMessage = (error: AuthError | Error | null): string => {
    if (!error) return 'An unknown error occurred';

    const errorMessage = error.message.toLowerCase();

    // Common Supabase auth errors
    if (errorMessage.includes('invalid login credentials')) {
        return 'Invalid email or password. Please try again.';
    }
    if (errorMessage.includes('email not confirmed')) {
        return 'Please verify your email address before signing in.';
    }
    if (errorMessage.includes('user already registered')) {
        return 'An account with this email already exists.';
    }
    if (errorMessage.includes('invalid email')) {
        return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('password')) {
        return 'Password must be at least 8 characters long.';
    }
    if (errorMessage.includes('network')) {
        return 'Network error. Please check your connection.';
    }
    if (errorMessage.includes('rate limit')) {
        return 'Too many attempts. Please try again later.';
    }

    // Return original message if no match
    return error.message;
};

/**
 * Create user profile in profiles table
 */
const createUserProfile = async (
    userId: string,
    email: string,
    name: string,
    phone?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.from('profiles').insert({
            id: userId,
            email,
            name,
            phone: phone || null,
            avatar_url: null,
            settings: {},
        });

        if (error) {
            console.error('Profile creation error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Profile creation exception:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user profile from profiles table
 */
const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Profile fetch error:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Profile fetch exception:', error);
        return null;
    }
};

/**
 * Supabase Authentication Service
 */
export const supabaseAuthService = {
    /**
     * Sign up a new user
     */
    async signUp(data: SignUpData): Promise<AuthResponse<{ user: User; profile: UserProfile }>> {
        try {
            // Validate inputs
            if (!data.email || !data.password || !data.name) {
                return {
                    success: false,
                    error: 'All fields are required',
                    code: 'VALIDATION_ERROR',
                };
            }

            // Validate email
            if (!isValidEmail(data.email)) {
                return {
                    success: false,
                    error: 'Please enter a valid email address',
                    code: 'INVALID_EMAIL',
                };
            }

            // Validate password strength
            const passwordCheck = isStrongPassword(data.password);
            if (!passwordCheck.valid) {
                return {
                    success: false,
                    error: passwordCheck.message,
                    code: 'WEAK_PASSWORD',
                };
            }

            // Validate name
            if (data.name.trim().length < 2) {
                return {
                    success: false,
                    error: 'Please enter your full name',
                    code: 'INVALID_NAME',
                };
            }

            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        phone: data.phone || null,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (authError) {
                return {
                    success: false,
                    error: getErrorMessage(authError),
                    code: authError.name,
                };
            }

            if (!authData.user) {
                return {
                    success: false,
                    error: 'Failed to create account. Please try again.',
                    code: 'SIGNUP_FAILED',
                };
            }

            // Create user profile
            const profileResult = await createUserProfile(
                authData.user.id,
                data.email,
                data.name,
                data.phone
            );

            if (!profileResult.success) {
                // Profile creation failed, but auth succeeded
                // We should still allow login, profile will be created on next attempt
                console.warn('Profile creation failed:', profileResult.error);
            }

            // Get complete profile
            const profile = await getUserProfile(authData.user.id);

            return {
                success: true,
                data: {
                    user: authData.user,
                    profile: profile || {
                        id: authData.user.id,
                        email: data.email,
                        name: data.name,
                        phone: data.phone || null,
                        avatar_url: null,
                    },
                },
            };
        } catch (error: any) {
            console.error('SignUp error:', error);
            return {
                success: false,
                error: getErrorMessage(error),
                code: 'UNKNOWN_ERROR',
            };
        }
    },

    /**
     * Sign in an existing user
     */
    async signIn(data: SignInData): Promise<AuthResponse<{ user: User; profile: UserProfile; session: Session }>> {
        try {
            // Validate inputs
            if (!data.email || !data.password) {
                return {
                    success: false,
                    error: 'Email and password are required',
                    code: 'VALIDATION_ERROR',
                };
            }

            // Validate email format
            if (!isValidEmail(data.email)) {
                return {
                    success: false,
                    error: 'Please enter a valid email address',
                    code: 'INVALID_EMAIL',
                };
            }

            // Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                return {
                    success: false,
                    error: getErrorMessage(authError),
                    code: authError.name,
                };
            }

            if (!authData.user || !authData.session) {
                return {
                    success: false,
                    error: 'Invalid credentials. Please try again.',
                    code: 'LOGIN_FAILED',
                };
            }

            // Get user profile
            let profile = await getUserProfile(authData.user.id);

            // If profile doesn't exist, create it (for users who signed up before profile system)
            if (!profile) {
                const name = authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User';
                const profileResult = await createUserProfile(
                    authData.user.id,
                    authData.user.email!,
                    name,
                    authData.user.user_metadata?.phone
                );

                if (profileResult.success) {
                    profile = await getUserProfile(authData.user.id);
                }
            }

            return {
                success: true,
                data: {
                    user: authData.user,
                    session: authData.session,
                    profile: profile || {
                        id: authData.user.id,
                        email: authData.user.email!,
                        name: authData.user.user_metadata?.name || 'User',
                        phone: authData.user.user_metadata?.phone || null,
                        avatar_url: null,
                    },
                },
            };
        } catch (error: any) {
            console.error('SignIn error:', error);
            return {
                success: false,
                error: getErrorMessage(error),
                code: 'UNKNOWN_ERROR',
            };
        }
    },

    /**
     * Sign out current user
     */
    async signOut(): Promise<AuthResponse> {
        try {
            const { error } = await authHelpers.signOut();

            if (error) {
                return {
                    success: false,
                    error: getErrorMessage(error),
                    code: error.name,
                };
            }

            return { success: true };
        } catch (error: any) {
            console.error('SignOut error:', error);
            return {
                success: false,
                error: getErrorMessage(error),
                code: 'UNKNOWN_ERROR',
            };
        }
    },

    /**
     * Get current session
     */
    async getSession(): Promise<AuthResponse<Session>> {
        try {
            const { session, error } = await authHelpers.getSession();

            if (error) {
                return {
                    success: false,
                    error: getErrorMessage(error),
                    code: error.name,
                };
            }

            if (!session) {
                return {
                    success: false,
                    error: 'No active session',
                    code: 'NO_SESSION',
                };
            }

            return {
                success: true,
                data: session,
            };
        } catch (error: any) {
            console.error('GetSession error:', error);
            return {
                success: false,
                error: getErrorMessage(error),
                code: 'UNKNOWN_ERROR',
            };
        }
    },

    /**
     * Get current user with profile
     */
    async getCurrentUser(): Promise<AuthResponse<{ user: User; profile: UserProfile }>> {
        try {
            const { user, error } = await authHelpers.getUser();

            if (error) {
                return {
                    success: false,
                    error: getErrorMessage(error),
                    code: error.name,
                };
            }

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                    code: 'NOT_AUTHENTICATED',
                };
            }

            const profile = await getUserProfile(user.id);

            return {
                success: true,
                data: {
                    user,
                    profile: profile || {
                        id: user.id,
                        email: user.email!,
                        name: user.user_metadata?.name || 'User',
                        phone: user.user_metadata?.phone || null,
                        avatar_url: null,
                    },
                },
            };
        } catch (error: any) {
            console.error('GetCurrentUser error:', error);
            return {
                success: false,
                error: getErrorMessage(error),
                code: 'UNKNOWN_ERROR',
            };
        }
    },

    /**
     * Send password reset email
     */
    async resetPassword(email: string): Promise<AuthResponse> {
        try {
            if (!email || !isValidEmail(email)) {
                return {
                    success: false,
                    error: 'Please enter a valid email address',
                    code: 'INVALID_EMAIL',
                };
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) {
                return {
                    success: false,
                    error: getErrorMessage(error),
                    code: error.name,
                };
            }

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('ResetPassword error:', error);
            return {
                success: false,
                error: getErrorMessage(error),
                code: 'UNKNOWN_ERROR',
            };
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResponse<UserProfile>> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: error.code,
                };
            }

            return {
                success: true,
                data: data,
            };
        } catch (error: any) {
            console.error('UpdateProfile error:', error);
            return {
                success: false,
                error: error.message,
                code: 'UNKNOWN_ERROR',
            };
        }
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback: (session: Session | null) => void) {
        return authHelpers.onAuthStateChange(callback);
    },
};

export default supabaseAuthService;
