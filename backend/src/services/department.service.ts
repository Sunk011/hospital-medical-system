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
