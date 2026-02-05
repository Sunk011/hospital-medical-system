import { Response } from 'express';
import { ApiResponse, PaginatedResponse, Pagination } from '../types';

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    code: statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: Response,
  list: T[],
  pagination: Pagination,
  message: string = 'Success'
): Response {
  const response: ApiResponse<PaginatedResponse<T>> = {
    code: 200,
    message,
    data: {
      list,
      pagination,
    },
    timestamp: new Date().toISOString(),
  };
  return res.status(200).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Array<{ field: string; message: string }>
): Response {
  const response: ApiResponse<null> & { errors?: Array<{ field: string; message: string }> } = {
    code: statusCode,
    message,
    data: null,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send created response
 */
export function sendCreated<T>(res: Response, data: T, message: string = 'Created successfully'): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send no content response
 */
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
