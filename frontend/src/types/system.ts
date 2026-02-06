export interface SystemUser {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  hasDoctorProfile: boolean;
}

export interface UserCreateData {
  username: string;
  password: string;
  email?: string | null;
  phone?: string | null;
  role: string;
}

export interface UserUpdateData {
  email?: string | null;
  phone?: string | null;
  role?: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface OperationLog {
  id: number;
  userId: number | null;
  username: string | null;
  module: string | null;
  action: string | null;
  targetId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: string;
}

export interface OperationLogParams {
  page?: number;
  pageSize?: number;
  userId?: number;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}
