/**
 * Supabase Chat Messages Service
 * Handles mental health chat history persistence
 */

import { supabase } from '../lib/supabase';
import type { ChatMessage } from '../types';

export interface ChatMessageInsert {
    role: 'user' | 'model';
    text: string;
}

export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Chat Messages Service
 */
export const supabaseChatService = {
    /**
     * Get all chat messages for current user
     */
    async getAll(): Promise<ServiceResponse<ChatMessage[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Get chat messages error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            // Transform to app format
            const messages: ChatMessage[] = (data || []).map(msg => ({
                id: msg.id,
                role: msg.role,
                text: msg.text,
                timestamp: new Date(msg.created_at),
            }));

            return {
                success: true,
                data: messages,
            };
        } catch (error: any) {
            console.error('Get chat messages exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch chat messages',
            };
        }
    },

    /**
     * Add a new chat message
     */
    async add(message: ChatMessageInsert): Promise<ServiceResponse<ChatMessage>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('chat_messages')
                .insert({
                    user_id: user.id,
                    role: message.role,
                    text: message.text,
                })
                .select()
                .single();

            if (error) {
                console.error('Add chat message error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const newMessage: ChatMessage = {
                id: data.id,
                role: data.role,
                text: data.text,
                timestamp: new Date(data.created_at),
            };

            return {
                success: true,
                data: newMessage,
            };
        } catch (error: any) {
            console.error('Add chat message exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to add chat message',
            };
        }
    },

    /**
     * Delete all chat messages (clear history)
     */
    async clearAll(): Promise<ServiceResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { error } = await supabase
                .from('chat_messages')
                .delete()
                .eq('user_id', user.id);

            if (error) {
                console.error('Clear chat messages error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: true,
            };
        } catch (error: any) {
            console.error('Clear chat messages exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to clear chat messages',
            };
        }
    },

    /**
     * Get recent chat messages (last N messages)
     */
    async getRecent(limit: number = 50): Promise<ServiceResponse<ChatMessage[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Get recent chat messages error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            // Reverse to get chronological order
            const messages: ChatMessage[] = (data || [])
                .reverse()
                .map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    text: msg.text,
                    timestamp: new Date(msg.created_at),
                }));

            return {
                success: true,
                data: messages,
            };
        } catch (error: any) {
            console.error('Get recent chat messages exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch recent messages',
            };
        }
    },

    /**
     * Get chat messages by date range
     */
    async getByDateRange(startDate: string, endDate: string): Promise<ServiceResponse<ChatMessage[]>> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return {
                    success: false,
                    error: 'Not authenticated',
                };
            }

            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', startDate)
                .lte('created_at', endDate)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Get chat messages by date range error:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const messages: ChatMessage[] = (data || []).map(msg => ({
                id: msg.id,
                role: msg.role,
                text: msg.text,
                timestamp: new Date(msg.created_at),
            }));

            return {
                success: true,
                data: messages,
            };
        } catch (error: any) {
            console.error('Get chat messages by date range exception:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch messages',
            };
        }
    },

    /**
     * Subscribe to real-time chat message changes
     */
    subscribeToChanges(callback: (payload: any) => void) {
        return supabase
            .channel('chat_messages_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_messages',
                },
                callback
            )
            .subscribe();
    },
};

export default supabaseChatService;
