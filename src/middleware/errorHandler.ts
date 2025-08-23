import { NextRequest, NextResponse } from 'next/server';

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL = 'INTERNAL',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE'
}

// Custom error class
export class ApiError extends Error {
  public statusCode: number;
  public errorType: ErrorType;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorType: ErrorType = ErrorType.INTERNAL,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
  }
}

// Error response formatter
export function formatErrorResponse(error: ApiError | Error): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        errorType: error.errorType,
        details: error.details,
        timestamp: new Date().toISOString()
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error);
  
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      errorType: ErrorType.INTERNAL,
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  );
}

// Error handler wrapper for API routes
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  };
}

// Specific error constructors
export const Errors = {
  validation: (message: string, details?: any) => 
    new ApiError(message, 400, ErrorType.VALIDATION, details),
  
  authentication: (message: string = 'Authentication required') => 
    new ApiError(message, 401, ErrorType.AUTHENTICATION),
  
  authorization: (message: string = 'Insufficient permissions') => 
    new ApiError(message, 403, ErrorType.AUTHORIZATION),
  
  notFound: (message: string = 'Resource not found') => 
    new ApiError(message, 404, ErrorType.NOT_FOUND),
  
  conflict: (message: string = 'Resource conflict') => 
    new ApiError(message, 409, ErrorType.INTERNAL),
  
  rateLimit: (message: string = 'Rate limit exceeded') => 
    new ApiError(message, 429, ErrorType.RATE_LIMIT),
  
  externalService: (message: string, details?: any) => 
    new ApiError(message, 502, ErrorType.EXTERNAL_SERVICE, details),
  
  internal: (message: string = 'Internal server error') => 
    new ApiError(message, 500, ErrorType.INTERNAL),
  
  internalServerError: (message: string = 'Internal server error') => 
    new ApiError(message, 500, ErrorType.INTERNAL)
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    const remaining = record.resetTime - Date.now();
    return Math.max(0, remaining);
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Request logging middleware
export function logRequest(request: NextRequest, response: NextResponse) {
  const startTime = Date.now();
  const { method, url } = request;
  const { status } = response;
  const duration = Date.now() - startTime;
  
  console.log(`${method} ${url} - ${status} - ${duration}ms`);
}

// Security middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}
