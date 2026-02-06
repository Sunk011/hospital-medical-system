import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Department, DepartmentListItem } from '@/types';
import {
  getDepartments as getDepartmentsApi,
  getActiveDepartments as getActiveDepartmentsApi,
  createDepartment as createDepartmentApi,
  updateDepartment as updateDepartmentApi,
  deleteDepartment as deleteDepartmentApi,
} from '@/api/department';
import { logger } from '@/utils';

export const useDepartmentStore = defineStore('department', () => {
  // State
  const departments = ref<Department[]>([]);
  const activeDepartments = ref<DepartmentListItem[]>([]);
  const loading = ref(false);

  // Getters
  const hasDepartments = computed(() => departments.value.length > 0);
  const totalDepartments = computed(() => departments.value.length);

  // Actions
  async function fetchDepartments(): Promise<boolean> {
    loading.value = true;
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
    } finally {
      loading.value = false;
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

  async function createDepartment(data: {
    name: string;
    code?: string | null;
    description?: string | null;
    status?: number;
  }): Promise<Department | null> {
    loading.value = true;
    try {
      const response = await createDepartmentApi(data);
      if (response.data) {
        await fetchDepartments();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to create department', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateDepartment(
    id: number,
    data: {
      name?: string;
      code?: string | null;
      description?: string | null;
      status?: number;
    }
  ): Promise<Department | null> {
    loading.value = true;
    try {
      const response = await updateDepartmentApi(id, data);
      if (response.data) {
        await fetchDepartments();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to update department', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteDepartment(id: number): Promise<boolean> {
    loading.value = true;
    try {
      await deleteDepartmentApi(id);
      await fetchDepartments();
      return true;
    } catch (error) {
      logger.error('Failed to delete department', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    departments,
    activeDepartments,
    loading,
    hasDepartments,
    totalDepartments,
    fetchDepartments,
    fetchActiveDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
});
