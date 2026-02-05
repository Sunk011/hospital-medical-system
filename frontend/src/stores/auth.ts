import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginRequest } from '@/types';
import { login as loginApi, logout as logoutApi, getProfile as getProfileApi } from '@/api/auth';
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  getStoredUser,
  setStoredUser,
  clearAuthStorage,
} from '@/utils/storage';
import { logger } from '@/utils';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(getStoredUser<User>());
  const accessToken = ref<string | null>(getToken());
  const refreshTokenValue = ref<string | null>(getRefreshToken());
  const loading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const userRole = computed(() => user.value?.role || null);
  const username = computed(() => user.value?.username || '');

  // Actions
  async function login(credentials: LoginRequest): Promise<boolean> {
    loading.value = true;
    try {
      const response = await loginApi(credentials);
      if (response.data) {
        const { user: userData, token } = response.data;

        // Store tokens
        setToken(token.accessToken);
        setRefreshToken(token.refreshToken);
        accessToken.value = token.accessToken;
        refreshTokenValue.value = token.refreshToken;

        // Store user
        setStoredUser(userData);
        user.value = userData;

        return true;
      }
      return false;
    } catch (error) {
      logger.error('Login failed', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      if (accessToken.value) {
        await logoutApi();
      }
    } catch (error) {
      logger.error('Logout API error', error);
    } finally {
      // Clear local state regardless of API result
      clearAuthStorage();
      user.value = null;
      accessToken.value = null;
      refreshTokenValue.value = null;
    }
  }

  async function fetchProfile(): Promise<boolean> {
    if (!accessToken.value) {
      return false;
    }

    loading.value = true;
    try {
      const response = await getProfileApi();
      if (response.data) {
        user.value = response.data;
        setStoredUser(response.data);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Fetch profile failed', error);
      return false;
    } finally {
      loading.value = false;
    }
  }

  function hasRole(roles: string | string[]): boolean {
    if (!user.value) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.value.role);
  }

  function isAdmin(): boolean {
    return user.value?.role === 'admin';
  }

  return {
    // State
    user,
    accessToken,
    refreshToken: refreshTokenValue,
    loading,
    // Getters
    isAuthenticated,
    userRole,
    username,
    // Actions
    login,
    logout,
    fetchProfile,
    hasRole,
    isAdmin,
  };
});
