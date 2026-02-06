import request from '@/utils/request';
import type { ApiResponse, Department, DepartmentListItem } from '@/types';

/**
 * Get all departments with doctor count
 */
export function getDepartments(): Promise<ApiResponse<Department[]>> {
  return request.get('/departments').then((res) => res.data);
}

/**
 * Get active departments (for dropdown)
 */
export function getActiveDepartments(): Promise<ApiResponse<DepartmentListItem[]>> {
  return request.get('/departments/active').then((res) => res.data);
}

/**
 * Get department by ID
 */
export function getDepartmentById(id: number): Promise<ApiResponse<Department>> {
  return request.get(`/departments/${id}`).then((res) => res.data);
}

/**
 * Create a new department
 */
export function createDepartment(data: {
  name: string;
  code?: string | null;
  description?: string | null;
  status?: number;
}): Promise<ApiResponse<Department>> {
  return request.post('/departments', data).then((res) => res.data);
}

/**
 * Update department
 */
export function updateDepartment(
  id: number,
  data: {
    name?: string;
    code?: string | null;
    description?: string | null;
    status?: number;
  }
): Promise<ApiResponse<Department>> {
  return request.put(`/departments/${id}`, data).then((res) => res.data);
}

/**
 * Delete department
 */
export function deleteDepartment(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/departments/${id}`).then((res) => res.data);
}
