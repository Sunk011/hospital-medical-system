import prisma from '../config/database';
import { ApiError } from '../middlewares';

// Department response interface
export interface DepartmentResponse {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  status: number;
  doctorCount: number;
  createdAt: Date;
}

// Department list item (simplified)
export interface DepartmentListItem {
  id: number;
  name: string;
  code: string | null;
}

export class DepartmentService {
  /**
   * Get all active departments (for dropdown)
   */
  async getActiveDepartments(): Promise<DepartmentListItem[]> {
    const departments = await prisma.department.findMany({
      where: { status: 1 },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });

    return departments;
  }

  /**
   * Get all departments with doctor count
   */
  async getDepartments(): Promise<DepartmentResponse[]> {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      description: dept.description,
      status: dept.status,
      doctorCount: dept._count.doctors,
      createdAt: dept.createdAt,
    }));
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: number): Promise<DepartmentResponse> {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { doctors: true },
        },
      },
    });

    if (!department) {
      throw new ApiError('Department not found', 404);
    }

    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description,
      status: department.status,
      doctorCount: department._count.doctors,
      createdAt: department.createdAt,
    };
  }

  /**
   * Create a new department
   */
  async createDepartment(data: {
    name: string;
    code?: string | null;
    description?: string | null;
    status?: number;
  }): Promise<DepartmentResponse> {
    // Check unique code if provided
    if (data.code) {
      const existing = await prisma.department.findUnique({ where: { code: data.code } });
      if (existing) {
        throw new ApiError('Department code already exists', 409);
      }
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        code: data.code || null,
        description: data.description || null,
        status: data.status ?? 1,
      },
      include: {
        _count: { select: { doctors: true } },
      },
    });

    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description,
      status: department.status,
      doctorCount: department._count.doctors,
      createdAt: department.createdAt,
    };
  }

  /**
   * Update department
   */
  async updateDepartment(
    id: number,
    data: {
      name?: string;
      code?: string | null;
      description?: string | null;
      status?: number;
    }
  ): Promise<DepartmentResponse> {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError('Department not found', 404);
    }

    // Check unique code if changed
    if (data.code && data.code !== existing.code) {
      const codeExists = await prisma.department.findUnique({ where: { code: data.code } });
      if (codeExists) {
        throw new ApiError('Department code already exists', 409);
      }
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        _count: { select: { doctors: true } },
      },
    });

    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description,
      status: department.status,
      doctorCount: department._count.doctors,
      createdAt: department.createdAt,
    };
  }

  /**
   * Delete department
   */
  async deleteDepartment(id: number): Promise<void> {
    const existing = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { doctors: true } } },
    });
    if (!existing) {
      throw new ApiError('Department not found', 404);
    }
    if (existing._count.doctors > 0) {
      throw new ApiError('Cannot delete department with associated doctors', 400);
    }

    await prisma.department.delete({ where: { id } });
  }

  /**
   * Check if department exists
   */
  async departmentExists(id: number): Promise<boolean> {
    const department = await prisma.department.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!department;
  }
}

export const departmentService = new DepartmentService();
