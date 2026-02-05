import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Patient,
  PatientListParams,
  PatientFormData,
  PatientStatistics,
  PatientHistory,
  Pagination,
} from '@/types';
import {
  getPatients as getPatientsApi,
  getPatientById as getPatientByIdApi,
  createPatient as createPatientApi,
  updatePatient as updatePatientApi,
  deletePatient as deletePatientApi,
  getPatientHistory as getPatientHistoryApi,
  getPatientStatistics as getPatientStatisticsApi,
} from '@/api/patient';
import { logger } from '@/utils';

export const usePatientStore = defineStore('patient', () => {
  // State
  const patients = ref<Patient[]>([]);
  const currentPatient = ref<Patient | null>(null);
  const patientHistory = ref<PatientHistory | null>(null);
  const statistics = ref<PatientStatistics | null>(null);
  const loading = ref(false);
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const filters = ref<PatientListParams>({
    page: 1,
    pageSize: 10,
  });

  // Getters
  const hasPatients = computed(() => patients.value.length > 0);
  const totalPatients = computed(() => pagination.value.total);

  // Actions
  async function fetchPatients(params?: PatientListParams): Promise<boolean> {
    loading.value = true;
    try {
      // Merge with existing filters
      const queryParams = { ...filters.value, ...params };
      filters.value = queryParams;

      const response = await getPatientsApi(queryParams);
      if (response.data) {
        patients.value = response.data.list;
        pagination.value = response.data.pagination;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch patients', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPatientById(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getPatientByIdApi(id);
      if (response.data) {
        currentPatient.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch patient', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function createPatient(data: PatientFormData): Promise<Patient | null> {
    loading.value = true;
    try {
      const response = await createPatientApi(data);
      if (response.data) {
        // Refresh the list
        await fetchPatients();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to create patient', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updatePatient(id: number, data: PatientFormData): Promise<Patient | null> {
    loading.value = true;
    try {
      const response = await updatePatientApi(id, data);
      if (response.data) {
        // Update current patient if it's the same
        if (currentPatient.value?.id === id) {
          currentPatient.value = response.data;
        }
        // Refresh the list
        await fetchPatients();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to update patient', error);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deletePatient(id: number): Promise<boolean> {
    loading.value = true;
    try {
      await deletePatientApi(id);
      // Clear current patient if it's the deleted one
      if (currentPatient.value?.id === id) {
        currentPatient.value = null;
      }
      // Refresh the list
      await fetchPatients();
      return true;
    } catch (error) {
      logger.error('Failed to delete patient', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPatientHistory(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getPatientHistoryApi(id);
      if (response.data) {
        patientHistory.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch patient history', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStatistics(): Promise<boolean> {
    try {
      const response = await getPatientStatisticsApi();
      if (response.data) {
        statistics.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch statistics', error);
      return false;
    }
  }

  function setFilters(newFilters: PatientListParams): void {
    filters.value = { ...filters.value, ...newFilters };
  }

  function clearFilters(): void {
    filters.value = {
      page: 1,
      pageSize: 10,
    };
  }

  function clearCurrentPatient(): void {
    currentPatient.value = null;
    patientHistory.value = null;
  }

  return {
    // State
    patients,
    currentPatient,
    patientHistory,
    statistics,
    loading,
    pagination,
    filters,
    // Getters
    hasPatients,
    totalPatients,
    // Actions
    fetchPatients,
    fetchPatientById,
    createPatient,
    updatePatient,
    deletePatient,
    fetchPatientHistory,
    fetchStatistics,
    setFilters,
    clearFilters,
    clearCurrentPatient,
  };
});
