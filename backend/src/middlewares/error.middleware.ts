import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    code: 404,
    message: `Route ${req.method} ${req.path} not found`,
    data: null,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      errors: err.errors,
      data: null,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError') {
    res.status(400).json({
      code: 400,
      message: 'Validation error',
      data: null,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      code: 400,
      message: 'Database operation failed',
      data: null,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      code: 401,
      message: 'Invalid or expired token',
      data: null,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Default error response
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    code: statusCode,
    message,
    data: null,
    timestamp: new Date().toISOString(),
  });
}
