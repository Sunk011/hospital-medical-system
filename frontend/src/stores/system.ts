import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Pagination } from '@/types';
import type {
  SystemUser,
  UserCreateData,
  UserUpdateData,
  UserListParams,
  OperationLog,
  OperationLogParams,
} from '@/types/system';
import {
  getUsers as getUsersApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  toggleUserStatus as toggleUserStatusApi,
  resetUserPassword as resetUserPasswordApi,
  getOperationLogs as getOperationLogsApi,
} from '@/api/system';
import { logger } from '@/utils';

export const useSystemStore = defineStore('system', () => {
  // User state
  const users = ref<SystemUser[]>([]);
  const userPagination = ref<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const userFilters = ref<UserListParams>({
    page: 1,
    pageSize: 10,
  });
  const userLoading = ref(false);

  // Log state
  const logs = ref<OperationLog[]>([]);
  const logPagination = ref<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const logFilters = ref<OperationLogParams>({
    page: 1,
    pageSize: 10,
  });
  const logLoading = ref(false);

  // User actions
  async function fetchUsers(params?: UserListParams): Promise<boolean> {
    userLoading.value = true;
    try {
      const queryParams = { ...userFilters.value, ...params };
      userFilters.value = queryParams;
      const response = await getUsersApi(queryParams);
      if (response.data) {
        users.value = response.data.list;
        userPagination.value = response.data.pagination;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch users', error);
      return false;
    } finally {
      userLoading.value = false;
    }
  }

  async function createUser(data: UserCreateData): Promise<SystemUser | null> {
    userLoading.value = true;
    try {
      const response = await createUserApi(data);
      if (response.data) {
        await fetchUsers();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to create user', error);
      throw error;
    } finally {
      userLoading.value = false;
    }
  }

  async function updateUser(
    id: number,
    data: UserUpdateData
  ): Promise<SystemUser | null> {
    userLoading.value = true;
    try {
      const response = await updateUserApi(id, data);
      if (response.data) {
        await fetchUsers();
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Failed to update user', error);
      throw error;
    } finally {
      userLoading.value = false;
    }
  }

  async function toggleUserStatus(id: number): Promise<boolean> {
    try {
      await toggleUserStatusApi(id);
      await fetchUsers();
      return true;
    } catch (error) {
      logger.error('Failed to toggle user status', error);
      throw error;
    }
  }

  async function resetUserPassword(
    id: number,
    newPassword: string
  ): Promise<boolean> {
    try {
      await resetUserPasswordApi(id, newPassword);
      return true;
    } catch (error) {
      logger.error('Failed to reset user password', error);
      throw error;
    }
  }

  function setUserFilters(newFilters: UserListParams): void {
    userFilters.value = { ...userFilters.value, ...newFilters };
  }

  function clearUserFilters(): void {
    userFilters.value = { page: 1, pageSize: 10 };
  }

  // Log actions
  async function fetchLogs(params?: OperationLogParams): Promise<boolean> {
    logLoading.value = true;
    try {
      const queryParams = { ...logFilters.value, ...params };
      logFilters.value = queryParams;
      const response = await getOperationLogsApi(queryParams);
      if (response.data) {
        logs.value = response.data.list;
        logPagination.value = response.data.pagination;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to fetch operation logs', error);
      return false;
    } finally {
      logLoading.value = false;
    }
  }

  function setLogFilters(newFilters: OperationLogParams): void {
    logFilters.value = { ...logFilters.value, ...newFilters };
  }

  function clearLogFilters(): void {
    logFilters.value = { page: 1, pageSize: 10 };
  }

  return {
    users,
    userPagination,
    userFilters,
    userLoading,
    logs,
    logPagination,
    logFilters,
    logLoading,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    resetUserPassword,
    setUserFilters,
    clearUserFilters,
    fetchLogs,
    setLogFilters,
    clearLogFilters,
  };
});
