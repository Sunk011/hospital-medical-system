import request from '@/utils/request';
import type { ApiResponse, AuthResponse, User, LoginRequest, TokenResponse } from '@/types';

/**
 * User login
 */
export function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  return request.post('/auth/login', data).then(res => res.data);
}

/**
 * User logout
 */
export function logout(): Promise<ApiResponse<null>> {
  return request.post('/auth/logout').then(res => res.data);
}

/**
 * Get current user profile
 */
export function getProfile(): Promise<ApiResponse<User>> {
  return request.get('/auth/profile').then(res => res.data);
}

/**
 * Change password
 */
export function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse<null>> {
  return request.put('/auth/password', data).then(res => res.data);
}

/**
 * Refresh access token
 */
export function refreshToken(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
  return request.post('/auth/refresh', { refreshToken }).then(res => res.data);
}
