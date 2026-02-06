import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config';
import { jwtConfig } from '../config/jwt';
import { JwtPayload, UserResponse, TokenResponse, AuthResponse } from '../types';
import { ApiError } from '../middlewares';
import { logger, getClientIp } from '../utils';

export class AuthService {
  /**
   * Login user with username and password
   */
  async login(
    username: string,
    password: string,
    req: { ip?: string; headers: { 'x-forwarded-for'?: string; 'user-agent'?: string } }
  ): Promise<AuthResponse> {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new ApiError('Invalid username or password', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new ApiError('Account is disabled', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid username or password', 401);
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Log the login action
    await this.logOperation(user.id, 'auth', 'login', user.id, req);

    logger.info(`User logged in: ${user.username}`);

    // Return user data and tokens
    return {
      user: this.formatUserResponse(user),
      token: tokens,
    };
  }

  /**
   * Logout user
   */
  async logout(
    userId: number,
    req: { ip?: string; headers: { 'x-forwarded-for'?: string; 'user-agent'?: string } }
  ): Promise<void> {
    // Log the logout action
    await this.logOperation(userId, 'auth', 'logout', userId, req);
    logger.info(`User logged out: ${userId}`);
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    return this.formatUserResponse(user);
  }

  /**
   * Get users list with optional filtering
   * Used for admin features like assigning user accounts to doctors
   */
  async getUsers(filters?: {
    role?: string;
    hasDoctor?: boolean;
  }): Promise<UserResponse[]> {
    const where: Record<string, unknown> = {
      status: 'active',
    };

    if (filters?.role) {
      where.role = filters.role;
    }

    // Filter users that don't have a doctor profile yet
    if (filters?.hasDoctor === false) {
      where.doctor = null;
    } else if (filters?.hasDoctor === true) {
      where.doctor = { isNot: null };
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { username: 'asc' },
    });

    return users.map((user) => this.formatUserResponse(user));
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    req: { ip?: string; headers: { 'x-forwarded-for'?: string; 'user-agent'?: string } }
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Log the password change
    await this.logOperation(userId, 'auth', 'change_password', userId, req);
    logger.info(`User changed password: ${userId}`);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as JwtPayload;

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.status !== 'active') {
        throw new ApiError('Invalid refresh token', 401);
      }

      // Generate new tokens
      return this.generateTokens({
        userId: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Invalid refresh token', 401);
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenResponse {
    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.expiresIn,
    };
  }

  /**
   * Format user response (exclude password)
   */
  private formatUserResponse(user: {
    id: number;
    username: string;
    email: string | null;
    phone: string | null;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    password?: string;
  }): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role as UserResponse['role'],
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Log operation to database
   */
  private async logOperation(
    userId: number,
    module: string,
    action: string,
    targetId: number,
    req: { ip?: string; headers: { 'x-forwarded-for'?: string; 'user-agent'?: string } }
  ): Promise<void> {
    try {
      await prisma.operationLog.create({
        data: {
          userId,
          module,
          action,
          targetId,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || null,
          details: JSON.stringify({ timestamp: new Date().toISOString() }),
        },
      });
    } catch (error) {
      logger.error('Failed to log operation:', error);
    }
  }
}

export const authService = new AuthService();
