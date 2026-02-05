import request from '@/utils/request';
import type {
  ApiResponse,
  PaginatedResponse,
  Patient,
  PatientListParams,
  PatientFormData,
  PatientStatistics,
  PatientMedicalRecord,
  PatientHistory,
} from '@/types';

/**
 * Get patient list with pagination and filtering
 */
export function getPatients(
  params: PatientListParams
): Promise<ApiResponse<PaginatedResponse<Patient>>> {
  return request.get('/patients', { params }).then((res) => res.data);
}

/**
 * Get patient by ID
 */
export function getPatientById(id: number): Promise<ApiResponse<Patient>> {
  return request.get(`/patients/${id}`).then((res) => res.data);
}

/**
 * Create new patient
 */
export function createPatient(data: PatientFormData): Promise<ApiResponse<Patient>> {
  return request.post('/patients', data).then((res) => res.data);
}

/**
 * Update patient information
 */
export function updatePatient(id: number, data: PatientFormData): Promise<ApiResponse<Patient>> {
  return request.put(`/patients/${id}`, data).then((res) => res.data);
}

/**
 * Delete patient
 */
export function deletePatient(id: number): Promise<ApiResponse<null>> {
  return request.delete(`/patients/${id}`).then((res) => res.data);
}

/**
 * Get patient's medical records
 */
export function getPatientRecords(
  id: number,
  params?: { page?: number; pageSize?: number }
): Promise<ApiResponse<PaginatedResponse<PatientMedicalRecord>>> {
  return request.get(`/patients/${id}/records`, { params }).then((res) => res.data);
}

/**
 * Get patient's medical history summary
 */
export function getPatientHistory(id: number): Promise<ApiResponse<PatientHistory>> {
  return request.get(`/patients/${id}/history`).then((res) => res.data);
}

/**
 * Get patient statistics
 */
export function getPatientStatistics(): Promise<ApiResponse<PatientStatistics>> {
  return request.get('/patients/statistics').then((res) => res.data);
}
