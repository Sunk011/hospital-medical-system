import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
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
import {
  getDashboardStatistics as getDashboardStatisticsApi,
  getVisitStatistics as getVisitStatisticsApi,
  getVisitTrend as getVisitTrendApi,
  getDepartmentStatistics as getDepartmentStatisticsApi,
  getDoctorPerformanceStats as getDoctorStatisticsApi,
  getPatientStatisticsDetail as getPatientStatisticsDetailApi,
  getDiseaseStatistics as getDiseaseStatisticsApi,
  getPrescriptionStatistics as getPrescriptionStatisticsApi,
  generateReport as generateReportApi,
} from '@/api/statistics';
import { logger } from '@/utils';

export const useStatisticsStore = defineStore('statistics', () => {
  // State
  const dashboardStats = ref<DashboardStatistics | null>(null);
  const visitStats = ref<VisitStatistics | null>(null);
  const visitTrend = ref<VisitTrendPoint[]>([]);
  const departmentStats = ref<DepartmentStatistics[]>([]);
  const doctorStats = ref<DoctorStatisticsItem[]>([]);
  const patientStats = ref<PatientStatisticsDetail | null>(null);
  const diseaseStats = ref<DiseaseStatistics[]>([]);
  const prescriptionStats = ref<PrescriptionStatistics | null>(null);
  const report = ref<StatisticsReport | null>(null);
  const loading = ref(false);
  const dateRange = ref<DateRangeFilter>({});

  // Actions
  async function fetchDashboardStatistics(): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getDashboardStatisticsApi();
      if (response.data) {
        dashboardStats.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch dashboard statistics', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchVisitStatistics(filter?: DateRangeFilter): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getVisitStatisticsApi(filter || dateRange.value);
      if (response.data) {
        visitStats.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch visit statistics', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchVisitTrend(filter?: DateRangeFilter): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getVisitTrendApi(filter || dateRange.value);
      if (response.data) {
        visitTrend.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch visit trend', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDepartmentStatistics(): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getDepartmentStatisticsApi();
      if (response.data) {
        departmentStats.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch department statistics', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDoctorStatistics(limit?: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getDoctorStatisticsApi({ limit });
      if (response.data) {
        doctorStats.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch doctor statistics', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPatientStatistics(): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getPatientStatisticsDetailApi();
      if (response.data) {
        patientStats.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch patient statistics', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDiseaseStatistics(
    filter?: DateRangeFilter & { limit?: number }
  ): Promise<boolean> {
    loading.value = true;
    try {
      const params = { ...dateRange.value, ...filter };
      const response = await getDiseaseStatisticsApi(params);
      if (response.data) {
        diseaseStats.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch disease statistics', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPrescriptionStatistics(filter?: DateRangeFilter): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getPrescriptionStatisticsApi(filter || dateRange.value);
      if (response.data) {
        prescriptionStats.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch prescription statistics', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchReport(filter?: DateRangeFilter): Promise<boolean> {
    loading.value = true;
    try {
      const response = await generateReportApi(filter || dateRange.value);
      if (response.data) {
        report.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to generate report', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  function setDateRange(filter: DateRangeFilter): void {
    dateRange.value = filter;
  }

  function clearDateRange(): void {
    dateRange.value = {};
  }

  function clearAll(): void {
    dashboardStats.value = null;
    visitStats.value = null;
    visitTrend.value = [];
    departmentStats.value = [];
    doctorStats.value = [];
    patientStats.value = null;
    diseaseStats.value = [];
    prescriptionStats.value = null;
    report.value = null;
    dateRange.value = {};
  }

  return {
    // State
    dashboardStats,
    visitStats,
    visitTrend,
    departmentStats,
    doctorStats,
    patientStats,
    diseaseStats,
    prescriptionStats,
    report,
    loading,
    dateRange,
    // Actions
    fetchDashboardStatistics,
    fetchVisitStatistics,
    fetchVisitTrend,
    fetchDepartmentStatistics,
    fetchDoctorStatistics,
    fetchPatientStatistics,
    fetchDiseaseStatistics,
    fetchPrescriptionStatistics,
    fetchReport,
    setDateRange,
    clearDateRange,
    clearAll,
  };
});
