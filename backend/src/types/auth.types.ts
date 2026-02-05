import { Request } from 'express';
import { UserRole } from '@prisma/client';

// JWT Payload interface
export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extended Request with user info
export interface AuthRequest extends Request {
  user?: JwtPayload;
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

// Login request body
export interface LoginRequest {
  username: string;
  password: string;
}

// User response (without password)
export interface UserResponse {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Token response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Auth response
export interface AuthResponse {
  user: UserResponse;
  token: TokenResponse;
}
