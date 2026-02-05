import prisma from '../config/database';
import { ApiError } from '../middlewares';
import { logger, getClientIp, calculatePagination } from '../utils';
import { Pagination } from '../types';
import { departmentService } from './department.service';

// Doctor filter interface
export interface DoctorFilters {
  name?: string;
  departmentId?: number;
  title?: string;
  specialty?: string;
  licenseNo?: string;
}

// Doctor create data interface
export interface DoctorCreateData {
  userId: number;
  departmentId?: number | null;
  name: string;
  title?: string | null;
  specialty?: string | null;
  licenseNo?: string | null;
  introduction?: string | null;
}

// Doctor update data interface
export interface DoctorUpdateData {
  departmentId?: number | null;
  name: string;
  title?: string | null;
  specialty?: string | null;
  licenseNo?: string | null;
  introduction?: string | null;
}

// Doctor response interface
export interface DoctorResponse {
  id: number;
  userId: number;
  name: string;
  title: string | null;
  specialty: string | null;
  licenseNo: string | null;
  introduction: string | null;
  createdAt: Date;
  department: {
    id: number;
    name: string;
  } | null;
  user: {
    id: number;
    username: string;
    email: string | null;
    phone: string | null;
    status: string;
  };
  recordsCount?: number;
}

// Doctor statistics interface
export interface DoctorStatistics {
  totalDoctors: number;
  newDoctorsThisMonth: number;
  departmentDistribution: Record<string, number>;
  titleDistribution: Record<string, number>;
}

// Request context for logging
interface RequestContext {
  ip?: string;
  headers: { 'x-forwarded-for'?: string; 'user-agent'?: string };
}

export class DoctorService {
  /**
   * Format doctor response
   */
  private formatDoctorResponse(doctor: {
    id: number;
    userId: number;
    name: string;
    title: string | null;
    specialty: string | null;
    licenseNo: string | null;
    introduction: string | null;
    createdAt: Date;
    department: { id: number; name: string } | null;
    user: {
      id: number;
      username: string;
      email: string | null;
      phone: string | null;
      status: string;
    };
    _count?: { medicalRecords: number };
  }): DoctorResponse {
    return {
      id: doctor.id,
      userId: doctor.userId,
      name: doctor.name,
      title: doctor.title,
      specialty: doctor.specialty,
      licenseNo: doctor.licenseNo,
      introduction: doctor.introduction,
      createdAt: doctor.createdAt,
      department: doctor.department
        ? { id: doctor.department.id, name: doctor.department.name }
        : null,
      user: {
        id: doctor.user.id,
        username: doctor.user.username,
        email: doctor.user.email,
        phone: doctor.user.phone,
        status: doctor.user.status,
      },
      recordsCount: doctor._count?.medicalRecords,
    };
  }

  /**
   * Create a new doctor
   */
  async createDoctor(
    data: DoctorCreateData,
    operatorId: number,
    req: RequestContext
  ): Promise<DoctorResponse> {
    // Check if user exists and has role 'doctor'
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, role: true, doctor: true },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    if (user.role !== 'doctor') {
      throw new ApiError('User must have role "doctor" to create a doctor profile', 400);
    }

    if (user.doctor) {
      throw new ApiError('User already has a doctor profile', 400);
    }

    // Check if department exists (if provided)
    if (data.departmentId) {
      const deptExists = await departmentService.departmentExists(data.departmentId);
      if (!deptExists) {
        throw new ApiError('Department not found', 404);
      }
    }

    // Check for duplicate license number
    if (data.licenseNo) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { licenseNo: data.licenseNo },
      });
      if (existingDoctor) {
        throw new ApiError('A doctor with this license number already exists', 400);
      }
    }

    // Create doctor
    const doctor = await prisma.doctor.create({
      data: {
        userId: data.userId,
        departmentId: data.departmentId || null,
        name: data.name,
        title: data.title || null,
        specialty: data.specialty || null,
        licenseNo: data.licenseNo || null,
        introduction: data.introduction || null,
      },
      include: {
        department: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    // Log operation
    await this.logOperation(operatorId, 'doctor', 'create', doctor.id, req, {
      name: doctor.name,
      userId: doctor.userId,
    });

    logger.info(`Doctor created: ${doctor.name} (ID: ${doctor.id}) by user ${operatorId}`);

    return this.formatDoctorResponse(doctor);
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(id: number): Promise<DoctorResponse> {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        _count: {
          select: { medicalRecords: true },
        },
      },
    });

    if (!doctor) {
      throw new ApiError('Doctor not found', 404);
    }

    return this.formatDoctorResponse(doctor);
  }

  /**
   * Get doctors with pagination and filtering
   */
  async getDoctors(
    filters: DoctorFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ list: DoctorResponse[]; pagination: Pagination }> {
    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.name) {
      where.name = { contains: filters.name };
    }
    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }
    if (filters.title) {
      where.title = { contains: filters.title };
    }
    if (filters.specialty) {
      where.specialty = { contains: filters.specialty };
    }
    if (filters.licenseNo) {
      where.licenseNo = filters.licenseNo;
    }

    // Get total count
    const total = await prisma.doctor.count({ where });

    // Calculate pagination
    const { skip, take, totalPages } = calculatePagination(page, pageSize, total);

    // Get doctors
    const doctors = await prisma.doctor.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        department: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        _count: {
          select: { medicalRecords: true },
        },
      },
    });

    return {
      list: doctors.map((d) => this.formatDoctorResponse(d)),
      pagination: {
        page,
        pageSize: take,
        total,
        totalPages,
      },
    };
  }

  /**
   * Update doctor information
   */
  async updateDoctor(
    id: number,
    data: DoctorUpdateData,
    operatorId: number,
    req: RequestContext
  ): Promise<DoctorResponse> {
    // Check if doctor exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      throw new ApiError('Doctor not found', 404);
    }

    // Check if department exists (if provided)
    if (data.departmentId) {
      const deptExists = await departmentService.departmentExists(data.departmentId);
      if (!deptExists) {
        throw new ApiError('Department not found', 404);
      }
    }

    // Check for duplicate license number if changed
    if (data.licenseNo && data.licenseNo !== existingDoctor.licenseNo) {
      const duplicateDoctor = await prisma.doctor.findUnique({
        where: { licenseNo: data.licenseNo },
      });
      if (duplicateDoctor) {
        throw new ApiError('A doctor with this license number already exists', 400);
      }
    }

    // Update doctor
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        departmentId: data.departmentId !== undefined ? data.departmentId : existingDoctor.departmentId,
        name: data.name,
        title: data.title || null,
        specialty: data.specialty || null,
        licenseNo: data.licenseNo || null,
        introduction: data.introduction || null,
      },
      include: {
        department: {
          select: { id: true, name: true },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    // Log operation
    await this.logOperation(operatorId, 'doctor', 'update', doctor.id, req, {
      name: doctor.name,
      changes: data,
    });

    logger.info(`Doctor updated: ${doctor.name} (ID: ${doctor.id}) by user ${operatorId}`);

    return this.formatDoctorResponse(doctor);
  }

  /**
   * Delete doctor
   */
  async deleteDoctor(
    id: number,
    operatorId: number,
    req: RequestContext
  ): Promise<void> {
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        _count: {
          select: { medicalRecords: true },
        },
      },
    });

    if (!doctor) {
      throw new ApiError('Doctor not found', 404);
    }

    // Check if doctor has medical records
    if (doctor._count.medicalRecords > 0) {
      throw new ApiError(
        'Cannot delete doctor with existing medical records. Please reassign or archive the records first.',
        400
      );
    }

    // Delete doctor
    await prisma.doctor.delete({
      where: { id },
    });

    // Log operation
    await this.logOperation(operatorId, 'doctor', 'delete', id, req, {
      name: doctor.name,
      userId: doctor.userId,
    });

    logger.info(`Doctor deleted: ${doctor.name} (ID: ${id}) by user ${operatorId}`);
  }

  /**
   * Get doctor statistics
   */
  async getStatistics(): Promise<DoctorStatistics> {
    // Get total doctors
    const totalDoctors = await prisma.doctor.count();

    // Get new doctors this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newDoctorsThisMonth = await prisma.doctor.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get department distribution
    const departmentGroups = await prisma.doctor.groupBy({
      by: ['departmentId'],
      _count: true,
    });

    // Get department names
    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
    });
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    const departmentDistribution: Record<string, number> = {};
    for (const group of departmentGroups) {
      const deptName = group.departmentId ? deptMap.get(group.departmentId) || 'Unknown' : 'Unassigned';
      departmentDistribution[deptName] = group._count;
    }

    // Get title distribution
    const titleGroups = await prisma.doctor.groupBy({
      by: ['title'],
      _count: true,
    });

    const titleDistribution: Record<string, number> = {};
    for (const group of titleGroups) {
      titleDistribution[group.title || 'No Title'] = group._count;
    }

    return {
      totalDoctors,
      newDoctorsThisMonth,
      departmentDistribution,
      titleDistribution,
    };
  }

  /**
   * Get doctors by department (for dropdown/selection)
   */
  async getDoctorsByDepartment(departmentId: number): Promise<Array<{ id: number; name: string; title: string | null }>> {
    const doctors = await prisma.doctor.findMany({
      where: { departmentId },
      select: {
        id: true,
        name: true,
        title: true,
      },
      orderBy: { name: 'asc' },
    });

    return doctors;
  }

  /**
   * Log operation to database
   */
  private async logOperation(
    userId: number,
    module: string,
    action: string,
    targetId: number,
    req: RequestContext,
    details?: Record<string, unknown>
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
          details: JSON.stringify({
            ...details,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (error) {
      logger.error('Failed to log operation:', error);
    }
  }
}

export const doctorService = new DoctorService();
