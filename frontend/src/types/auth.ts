// User roles
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist';

// User status
export type UserStatus = 'active' | 'inactive';

// User interface
export interface User {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// Login request
export interface LoginRequest {
  username: string;
  password: string;
}

// Token response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Auth response
export interface AuthResponse {
  user: User;
  token: TokenResponse;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
