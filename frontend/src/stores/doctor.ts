import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Doctor,
  DoctorListParams,
  DoctorCreateData,
  DoctorUpdateData,
  DoctorStatistics,
  DoctorListItem,
  Department,
  DepartmentListItem,
  Pagination,
} from '@/types';
import {
  getDoctors as getDoctorsApi,
  getDoctorById as getDoctorByIdApi,
  createDoctor as createDoctorApi,
  updateDoctor as updateDoctorApi,
  deleteDoctor as deleteDoctorApi,
  getDoctorStatistics as getDoctorStatisticsApi,
  getDoctorsByDepartment as getDoctorsByDepartmentApi,
  getDepartments as getDepartmentsApi,
  getActiveDepartments as getActiveDepartmentsApi,
} from '@/api/doctor';
import { logger } from '@/utils';

export const useDoctorStore = defineStore('doctor', () => {
  // State
  const doctors = ref<Doctor[]>([]);
  const currentDoctor = ref<Doctor | null>(null);
  const statistics = ref<DoctorStatistics | null>(null);
  const departments = ref<Department[]>([]);
  const activeDepartments = ref<DepartmentListItem[]>([]);
  const departmentDoctors = ref<DoctorListItem[]>([]);
  const loading = ref(false);
  const pagination = ref<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const filters = ref<DoctorListParams>({
    page: 1,
    pageSize: 10,
  });

  // Getters
  const hasDoctors = computed(() => doctors.value.length > 0);
  const totalDoctors = computed(() => pagination.value.total);

  // Actions
  async function fetchDoctors(params?: DoctorListParams): Promise<boolean> {
    loading.value = true;
    try {
      // Merge with existing filters
      const queryParams = { ...filters.value, ...params };
      filters.value = queryParams;

      const response = await getDoctorsApi(queryParams);
      if (response.data) {
        doctors.value = response.data.list;
        pagination.value = response.data.pagination;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch doctors', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDoctorById(id: number): Promise<boolean> {
    loading.value = true;
    try {
      const response = await getDoctorByIdApi(id);
      if (response.data) {
        currentDoctor.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch doctor', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function createDoctor(data: DoctorCreateData): Promise<Doctor | null> {
    loading.value = true;
    try {
      const response = await createDoctorApi(data);
      if (response.data) {
        // Refresh the list
        await fetchDoctors();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to create doctor', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateDoctor(id: number, data: DoctorUpdateData): Promise<Doctor | null> {
    loading.value = true;
    try {
      const response = await updateDoctorApi(id, data);
      if (response.data) {
        // Update current doctor if it's the same
        if (currentDoctor.value?.id === id) {
          currentDoctor.value = response.data;
        }
        // Refresh the list
        await fetchDoctors();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to update doctor', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteDoctor(id: number): Promise<boolean> {
    loading.value = true;
    try {
      await deleteDoctorApi(id);
      // Clear current doctor if it's the deleted one
      if (currentDoctor.value?.id === id) {
        currentDoctor.value = null;
      }
      // Refresh the list
      await fetchDoctors();
      return true;
    } catch (error) {
      logger.error('Failed to delete doctor', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStatistics(): Promise<boolean> {
    try {
      const response = await getDoctorStatisticsApi();
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

  async function fetchDepartments(): Promise<boolean> {
    try {
      const response = await getDepartmentsApi();
      if (response.data) {
        departments.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch departments', error);
      return false;
    }
  }

  async function fetchActiveDepartments(): Promise<boolean> {
    try {
      const response = await getActiveDepartmentsApi();
      if (response.data) {
        activeDepartments.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch active departments', error);
      return false;
    }
  }

  async function fetchDoctorsByDepartment(departmentId: number): Promise<boolean> {
    try {
      const response = await getDoctorsByDepartmentApi(departmentId);
      if (response.data) {
        departmentDoctors.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch doctors by department', error);
      return false;
    }
  }

  function setFilters(newFilters: DoctorListParams): void {
    filters.value = { ...filters.value, ...newFilters };
  }

  function clearFilters(): void {
    filters.value = {
      page: 1,
      pageSize: 10,
    };
  }

  function clearCurrentDoctor(): void {
    currentDoctor.value = null;
  }

  return {
    // State
    doctors,
    currentDoctor,
    statistics,
    departments,
    activeDepartments,
    departmentDoctors,
    loading,
    pagination,
    filters,
    // Getters
    hasDoctors,
    totalDoctors,
    // Actions
    fetchDoctors,
    fetchDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    fetchStatistics,
    fetchDepartments,
    fetchActiveDepartments,
    fetchDoctorsByDepartment,
    setFilters,
    clearFilters,
    clearCurrentDoctor,
  };
});
