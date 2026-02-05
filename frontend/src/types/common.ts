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

// Paginated response
export interface PaginatedResponse<T> {
  list: T[];
  pagination: Pagination;
}

// Query parameters
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

// Menu item interface
export interface MenuItem {
  path: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
  roles?: string[];
}
