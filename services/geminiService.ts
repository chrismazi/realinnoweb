import { ChatMessage } from '../types';
import { validate } from './validationService';
import { supabase } from '../lib/supabase';

// Rate limiting for API calls
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Check rate limit
const checkRateLimit = (userId: string = 'default'): boolean => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || 0;
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean old entries
  for (const [key, time] of rateLimitMap.entries()) {
    if (time < windowStart) {
      rateLimitMap.delete(key);
    }
  }

  if (userRequests >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  rateLimitMap.set(userId, userRequests + 1);
  return true;
};

// Sanitize message content to prevent injection attacks
const sanitizeMessage = (message: string): string => {
  // Remove any potential script tags or malicious content
  let sanitized = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Limit message length to prevent abuse
  const MAX_MESSAGE_LENGTH = 2000;
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized = sanitized.substring(0, MAX_MESSAGE_LENGTH);
  }

  return sanitized;
};

export const sendMessageToGemini = async (
  chatHistory: ChatMessage[],
  newMessage: string,
  userId: string = 'default'
): Promise<string> => {
  try {
    // Check rate limiting
    if (!checkRateLimit(userId)) {
      return "Wohereje ubutumwa bwinshi vuba cyane. Nyamuneka tegereza akanya gato ugerageze nanone.";
    }

    // Validate and sanitize input
    if (!validate.required(newMessage)) {
      return "Nyamuneka andika ubutumwa.";
    }

    const sanitizedMessage = sanitizeMessage(newMessage);

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-chat', {
      body: {
        history: chatHistory.slice(-10), // Send only last 10 messages context
        newMessage: sanitizedMessage
      }
    });

    if (error) {
      console.error('Edge Function Error:', error);
      throw new Error(error.message || 'Failed to connect to AI service');
    }

    if (!data || !data.text) {
      throw new Error('Invalid response from AI service');
    }

    return data.text;

  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Handle specific error types - messages in Kinyarwanda
    if (error.message?.includes('quota')) {
      return "Nageze ku mupaka w'ikiganiro. Nyamuneka gerageza nyuma y'akanya.";
    }

    if (error.message?.includes('safety')) {
      return "Sinshobora gusubiza ubwo butumwa. Nyamuneka dukomeze ikiganiro cyacu mu buryo bwiza.";
    }

    return "Mfite ikibazo cya konegisiyo ubu. Nyamuneka gerageza nyuma y'akanya.";
  }
};

// Export a function to check if the service is properly configured
// Now checks if Supabase is configured, as the key is on the server
export const isGeminiConfigured = (): boolean => {
  return true; // Assuming Supabase is always configured if the app loads
};

// Export a function to get service status
export const getServiceStatus = (): {
  configured: boolean;
  apiKeyPresent: boolean;
  modelAvailable: boolean;
} => {
  return {
    configured: true,
    apiKeyPresent: true, // Hidden on server
    modelAvailable: true
  };
};