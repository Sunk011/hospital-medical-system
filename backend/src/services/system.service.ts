import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { config } from '../config';
import { ApiError } from '../middlewares';
import { logger, calculatePagination } from '../utils';
import { Pagination } from '../types';

// User response (no password)
export interface SystemUserResponse {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  hasDoctorProfile: boolean;
}

// Operation log response
export interface OperationLogResponse {
  id: number;
  userId: number | null;
  username: string | null;
  module: string | null;
  action: string | null;
  targetId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: Date;
}

// User filters
export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
}

// Log filters
export interface LogFilters {
  userId?: number;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WhereClause = Record<string, any>;

export class SystemService {
  /**
   * Get paginated user list
   */
  async getUsers(
    filters: UserFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ list: SystemUserResponse[]; pagination: Pagination }> {
    const where: WhereClause = {};

    if (filters.search) {
      where.OR = [
        { username: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }
    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const total = await prisma.user.count({ where });
    const { skip, take, totalPages } = calculatePagination(page, pageSize, total);

    const users = await prisma.user.findMany({
      where,
      include: {
        doctor: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const list = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      hasDoctorProfile: !!user.doctor,
    }));

    return {
      list,
      pagination: {
        page,
        pageSize: take,
        total,
        totalPages,
      },
    };
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    username: string;
    password: string;
    email?: string | null;
    phone?: string | null;
    role: string;
  }): Promise<SystemUserResponse> {
    // Check unique username
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new ApiError('Username already exists', 409);
    }

    // Check unique email if provided
    if (data.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new ApiError('Email already exists', 409);
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        email: data.email || null,
        phone: data.phone || null,
        role: data.role as 'admin' | 'doctor' | 'nurse' | 'receptionist',
      },
      include: {
        doctor: { select: { id: true } },
      },
    });

    logger.info(`User created: ${user.username} (role: ${user.role})`);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      hasDoctorProfile: !!user.doctor,
    };
  }

  /**
   * Update user info
   */
  async updateUser(
    id: number,
    data: {
      email?: string | null;
      phone?: string | null;
      role?: string;
    }
  ): Promise<SystemUserResponse> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('User not found', 404);
    }

    // Check unique email if changed
    if (data.email && data.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new ApiError('Email already exists', 409);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.role !== undefined && {
          role: data.role as 'admin' | 'doctor' | 'nurse' | 'receptionist',
        }),
      },
      include: {
        doctor: { select: { id: true } },
      },
    });

    logger.info(`User updated: ${user.username}`);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      hasDoctorProfile: !!user.doctor,
    };
  }

  /**
   * Toggle user status (active/inactive)
   */
  async toggleUserStatus(id: number): Promise<SystemUserResponse> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('User not found', 404);
    }

    const newStatus = existing.status === 'active' ? 'inactive' : 'active';

    const user = await prisma.user.update({
      where: { id },
      data: { status: newStatus as 'active' | 'inactive' },
      include: {
        doctor: { select: { id: true } },
      },
    });

    logger.info(`User status changed: ${user.username} -> ${newStatus}`);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      hasDoctorProfile: !!user.doctor,
    };
  }

  /**
   * Reset user password
   */
  async resetUserPassword(id: number, newPassword: string): Promise<void> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('User not found', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    logger.info(`Password reset for user: ${existing.username}`);
  }

  /**
   * Get paginated operation logs
   */
  async getOperationLogs(
    filters: LogFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ list: OperationLogResponse[]; pagination: Pagination }> {
    const where: WhereClause = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.module) {
      where.module = { contains: filters.module };
    }
    if (filters.action) {
      where.action = { contains: filters.action };
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate + 'T23:59:59.999Z');
      }
    }

    const total = await prisma.operationLog.count({ where });
    const { skip, take, totalPages } = calculatePagination(page, pageSize, total);

    const logs = await prisma.operationLog.findMany({
      where,
      include: {
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const list = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      username: log.user?.username || null,
      module: log.module,
      action: log.action,
      targetId: log.targetId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.details,
      createdAt: log.createdAt,
    }));

    return {
      list,
      pagination: {
        page,
        pageSize: take,
        total,
        totalPages,
      },
    };
  }
}

export const systemService = new SystemService();
