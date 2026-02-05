import request from '@/utils/request';
import type {
  ApiResponse,
  DateRangeFilter,
  DashboardStatistics,
  VisitStatistics,
  VisitTrendPoint,
  DepartmentStatistics,
  DoctorStatisticsItem,
  PatientStatisticsDetail,
  DiseaseStatistics,
  PrescriptionStatistics,
  StatisticsReport,
} from '@/types';

/**
 * Get dashboard statistics
 */
export function getDashboardStatistics(): Promise<ApiResponse<DashboardStatistics>> {
  return request.get('/statistics/dashboard').then((res) => res.data);
}

/**
 * Get visit statistics
 */
export function getVisitStatistics(
  params?: DateRangeFilter
): Promise<ApiResponse<VisitStatistics>> {
  return request.get('/statistics/visits', { params }).then((res) => res.data);
}

/**
 * Get visit trend data
 */
export function getVisitTrend(
  params?: DateRangeFilter
): Promise<ApiResponse<VisitTrendPoint[]>> {
  return request.get('/statistics/visits/trend', { params }).then((res) => res.data);
}

/**
 * Get department statistics
 */
export function getDepartmentStatistics(): Promise<ApiResponse<DepartmentStatistics[]>> {
  return request.get('/statistics/departments').then((res) => res.data);
}

/**
 * Get doctor performance statistics (for statistics module)
 */
export function getDoctorPerformanceStats(
  params?: { limit?: number }
): Promise<ApiResponse<DoctorStatisticsItem[]>> {
  return request.get('/statistics/doctors', { params }).then((res) => res.data);
}

/**
 * Get patient statistics
 */
export function getPatientStatisticsDetail(): Promise<ApiResponse<PatientStatisticsDetail>> {
  return request.get('/statistics/patients').then((res) => res.data);
}

/**
 * Get disease statistics
 */
export function getDiseaseStatistics(
  params?: DateRangeFilter & { limit?: number }
): Promise<ApiResponse<DiseaseStatistics[]>> {
  return request.get('/statistics/diseases', { params }).then((res) => res.data);
}

/**
 * Get prescription statistics
 */
export function getPrescriptionStatistics(
  params?: DateRangeFilter
): Promise<ApiResponse<PrescriptionStatistics>> {
  return request.get('/statistics/prescriptions', { params }).then((res) => res.data);
}

/**
 * Generate comprehensive report
 */
export function generateReport(
  params?: DateRangeFilter
): Promise<ApiResponse<StatisticsReport>> {
  return request.get('/statistics/report', { params }).then((res) => res.data);
}
