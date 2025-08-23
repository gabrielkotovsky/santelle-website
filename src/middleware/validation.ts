import { NextRequest } from 'next/server';

// Validation schemas
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object';
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => boolean;
  };
}





// Predefined validation schemas
export const subscribeSchema: ValidationSchema = {
  email: {
    type: 'string',
    required: true,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: unknown) => typeof value === 'string' && value.includes('@') && value.includes('.')
  },
  screenData: {
    type: 'object',
    required: false
  }
};

export const contactSchema: ValidationSchema = {
  name: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  email: {
    type: 'string',
    required: true,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: unknown) => typeof value === 'string' && value.includes('@') && value.includes('.')
  },
  subject: {
    type: 'string',
    required: false,
    maxLength: 200
  },
  message: {
    type: 'string',
    required: true,
    maxLength: 2000,
    minLength: 1
  },
  updates: {
    type: 'boolean',
    required: false
  }
};

// Helper function to validate request body
export async function validateRequestBody(request: NextRequest, schema: ValidationSchema) {
  try {
    const body = await request.json();
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      
      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        throw new Error(`${field} is required`);
      }
      
      // Skip validation for optional fields that aren't provided
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }
      
      // Type validation
      if (rules.type === 'string' && typeof value !== 'string') {
        throw new Error(`${field} must be a string`);
      }
      
      if (rules.type === 'number' && typeof value !== 'number') {
        throw new Error(`${field} must be a number`);
      }
      
      if (rules.type === 'boolean' && typeof value !== 'boolean') {
        throw new Error(`${field} must be a boolean`);
      }
      
      if (rules.type === 'object' && typeof value !== 'object') {
        throw new Error(`${field} must be an object`);
      }
      
      // String-specific validations
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          throw new Error(`${field} must be at least ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          throw new Error(`${field} must be no more than ${rules.maxLength} characters`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          throw new Error(`${field} format is invalid`);
        }
      }
      
      // Custom validation
      if (rules.custom && !rules.custom(value)) {
        throw new Error(`${field} validation failed`);
      }
    }
    
    return body; // Validation passed, return the body
  } catch (error) {
    throw error;
  }
}
