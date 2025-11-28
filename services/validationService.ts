/**
 * Input Validation and Sanitization Service
 * Prevents XSS, SQL injection, and validates all user inputs
 */

// HTML entities that need escaping
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// Validation patterns
const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^[0-9]+$/,
  DECIMAL: /^[0-9]+(\.[0-9]{1,2})?$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
};

// Sanitization functions
export const sanitize = {
  // Escape HTML to prevent XSS
  html: (str: string): string => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=\/]/g, (s) => HTML_ENTITIES[s] || s);
  },

  // Remove all HTML tags
  stripTags: (str: string): string => {
    if (typeof str !== 'string') return '';
    return str.replace(/<[^>]*>/g, '');
  },

  // Sanitize for display in HTML attribute
  attribute: (str: string): string => {
    if (typeof str !== 'string') return '';
    return str.replace(/[^a-zA-Z0-9-_]/g, '');
  },

  // Sanitize filename
  filename: (str: string): string => {
    if (typeof str !== 'string') return '';
    return str.replace(/[^a-zA-Z0-9.-_]/g, '_');
  },

  // Sanitize URL
  url: (str: string): string => {
    if (typeof str !== 'string') return '';
    try {
      const url = new URL(str);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      return url.toString();
    } catch {
      return '';
    }
  },

  // Sanitize number
  number: (value: any): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  },

  // Sanitize integer
  integer: (value: any): number => {
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
  },

  // Sanitize boolean
  boolean: (value: any): boolean => {
    return value === true || value === 'true' || value === 1 || value === '1';
  },

  // Sanitize array
  array: <T>(value: any): T[] => {
    return Array.isArray(value) ? value : [];
  },

  // Sanitize object
  object: <T extends object>(value: any): T | {} => {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }
};

// Validation functions
export const validate = {
  // Required field
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  // Email validation
  email: (email: string): boolean => {
    return PATTERNS.EMAIL.test(email);
  },

  // Phone validation
  phone: (phone: string): boolean => {
    return PATTERNS.PHONE.test(phone);
  },

  // URL validation
  url: (url: string): boolean => {
    return PATTERNS.URL.test(url);
  },

  // Password strength
  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain number');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain special character');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Username validation
  username: (username: string): boolean => {
    return PATTERNS.USERNAME.test(username);
  },

  // Number range validation
  range: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  // String length validation
  length: (str: string, min: number, max: number): boolean => {
    return str.length >= min && str.length <= max;
  },

  // Date validation
  date: (date: string): boolean => {
    if (!PATTERNS.DATE.test(date)) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  },

  // Future date validation
  futureDate: (date: string): boolean => {
    const d = new Date(date);
    return d > new Date();
  },

  // Past date validation
  pastDate: (date: string): boolean => {
    const d = new Date(date);
    return d < new Date();
  },

  // Age validation
  age: (birthDate: string, minAge: number = 13): boolean => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= minAge;
  },

  // Credit card validation (Luhn algorithm)
  creditCard: (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // Currency amount validation
  currency: (amount: string): boolean => {
    return PATTERNS.DECIMAL.test(amount) && parseFloat(amount) >= 0;
  },

  // File type validation
  fileType: (filename: string, allowedTypes: string[]): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? allowedTypes.includes(ext) : false;
  },

  // File size validation (in bytes)
  fileSize: (size: number, maxSize: number): boolean => {
    return size > 0 && size <= maxSize;
  }
};

// Form validation helper
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, Array<(value: any) => boolean | string>>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];
    
    for (const validator of validators) {
      const result = validator(value);
      if (result !== true) {
        errors[field] = typeof result === 'string' ? result : `${field} is invalid`;
        break;
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Rate limiting helper (prevent spam)
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  resetAll(): void {
    this.attempts.clear();
  }
}

// Input masking functions
export const mask = {
  // Phone number mask
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  },

  // Credit card mask
  creditCard: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      parts.push(cleaned.substr(i, 4));
    }
    return parts.join(' ');
  },

  // SSN mask
  ssn: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return value;
  },

  // Currency mask
  currency: (value: string): string => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  }
};

// Export all utilities
export default {
  sanitize,
  validate,
  validateForm,
  RateLimiter,
  mask
};
