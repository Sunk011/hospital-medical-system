// API Response interface
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
  timestamp: string;
}

// Pagination interface
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  list: T[];
  pagination: Pagination;
}

// Query parameters for pagination
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error response
export interface ErrorResponse {
  code: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}
