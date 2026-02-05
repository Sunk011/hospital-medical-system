import request from '@/utils/request';
import type {
  ApiResponse,
  PaginatedResponse,
  Doctor,
  DoctorListParams,
  DoctorCreateData,
  DoctorUpdateData,
  DoctorStatistics,
  DoctorListItem,
  Department,
  DepartmentListItem,
} from '@/types';

/**
 * Get doctor list with pagination and filtering
 */
export function getDoctors(
  params: DoctorListParams
): Promise<ApiResponse<PaginatedResponse<Doctor>>> {
  return request.get('/doctors', { params }).then((res) => res.data);
}

/**
 * Get doctor by ID
 */
export function getDoctorById(id: number): Promise<ApiResponse<Doctor>> {
  return request.get(`/doctors/${id}`).then((res) => res.data);
}

/**
 * Create new doctor
 */
export function createDoctor(data: DoctorCreateData): Promise<ApiResponse<Doctor>> {
  return request.post('/doctors', data).then((res) => res.data);
}

/**
 * Update doctor information
 */
export function updateDoctor(id: number, data: DoctorUpdateData): Promise<ApiResponse<Doctor>> {
  return request.put(`/doctors/${id}`, data).then((res) => res.data);
}

/**
 * Delete doctor
 */
export function deleteDoctor(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/doctors/${id}`).then((res) => res.data);
}

/**
 * Get doctor statistics
 */
export function getDoctorStatistics(): Promise<ApiResponse<DoctorStatistics>> {
  return request.get('/doctors/statistics').then((res) => res.data);
}

/**
 * Get doctors by department (for dropdown)
 */
export function getDoctorsByDepartment(departmentId: number): Promise<ApiResponse<DoctorListItem[]>> {
  return request.get(`/doctors/by-department/${departmentId}`).then((res) => res.data);
}

/**
 * Get all departments
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
