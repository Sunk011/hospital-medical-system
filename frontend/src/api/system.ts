import request from '@/utils/request';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type {
  SystemUser,
  UserCreateData,
  UserUpdateData,
  UserListParams,
  OperationLog,
  OperationLogParams,
} from '@/types/system';

/**
 * Get paginated user list
 */
export function getUsers(
  params: UserListParams
): Promise<ApiResponse<PaginatedResponse<SystemUser>>> {
  return request.get('/system/users', { params }).then((res) => res.data);
}

/**
 * Create a new user
 */
export function createUser(data: UserCreateData): Promise<ApiResponse<SystemUser>> {
  return request.post('/system/users', data).then((res) => res.data);
}

/**
 * Update user information
 */
export function updateUser(
  id: number,
  data: UserUpdateData
): Promise<ApiResponse<SystemUser>> {
  return request.put(`/system/users/${id}`, data).then((res) => res.data);
}

/**
 * Toggle user active/inactive status
 */
export function toggleUserStatus(id: number): Promise<ApiResponse<SystemUser>> {
  return request.patch(`/system/users/${id}/status`).then((res) => res.data);
}

/**
 * Reset user password
 */
export function resetUserPassword(
  id: number,
  newPassword: string
): Promise<ApiResponse<null>> {
  return request
    .patch(`/system/users/${id}/reset-password`, { newPassword })
    .then((res) => res.data);
}

/**
 * Get paginated operation logs
 */
export function getOperationLogs(
  params: OperationLogParams
): Promise<ApiResponse<PaginatedResponse<OperationLog>>> {
  return request.get('/system/logs', { params }).then((res) => res.data);
}
