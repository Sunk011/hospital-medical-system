import prisma from '../config/database';
import { ApiError } from '../middlewares';
import { logger, getClientIp, calculatePagination } from '../utils';
import { Pagination } from '../types';

// Visit type
export type VisitType = 'outpatient' | 'emergency' | 'inpatient';

// Record status
export type RecordStatus = 'draft' | 'confirmed' | 'archived';

// Medical record filter interface
export interface MedicalRecordFilters {
  recordNo?: string;
  patientId?: number;
  patientName?: string;
  doctorId?: number;
  doctorName?: string;
  departmentId?: number;
  visitType?: VisitType;
  status?: RecordStatus;
  startDate?: string;
  endDate?: string;
}

// Medical record create data interface
export interface MedicalRecordCreateData {
  patientId: number;
  doctorId: number;
  departmentId?: number | null;
  visitType?: VisitType;
  visitDate: Date | string;
  chiefComplaint?: string | null;
  presentIllness?: string | null;
  physicalExam?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  prescription?: string | null;
  notes?: string | null;
}

// Medical record update data interface
export interface MedicalRecordUpdateData {
  patientId?: number;
  doctorId?: number;
  departmentId?: number | null;
  visitType?: VisitType;
  visitDate?: Date | string;
  chiefComplaint?: string | null;
  presentIllness?: string | null;
  physicalExam?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  prescription?: string | null;
  notes?: string | null;
}

// Medical record response interface
export interface MedicalRecordResponse {
  id: number;
  recordNo: string;
  patientId: number;
  doctorId: number;
  departmentId: number | null;
  visitType: string | null;
  visitDate: Date;
  chiefComplaint: string | null;
  presentIllness: string | null;
  physicalExam: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  prescription: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: {
    id: number;
    medicalNo: string;
    name: string;
    gender: string | null;
    birthDate: Date | null;
    phone: string | null;
  };
  doctor?: {
    id: number;
    name: string;
    title: string | null;
  };
  department?: {
    id: number;
    name: string;
  } | null;
  prescriptions?: Array<{
    id: number;
    medicineName: string;
    specification: string | null;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    quantity: number | null;
    notes: string | null;
  }>;
  attachments?: Array<{
    id: number;
    fileName: string;
    fileType: string | null;
    fileSize: number | null;
    description: string | null;
    createdAt: Date;
  }>;
  _count?: {
    prescriptions: number;
    attachments: number;
  };
}

// Medical record statistics interface
export interface MedicalRecordStatistics {
  totalRecords: number;
  recordsThisMonth: number;
  statusDistribution: Record<string, number>;
  visitTypeDistribution: Record<string, number>;
  departmentDistribution: Array<{ departmentId: number; departmentName: string; count: number }>;
}

// Request context for logging
interface RequestContext {
  ip?: string;
  headers: { 'x-forwarded-for'?: string; 'user-agent'?: string };
}

export class MedicalRecordService {
  /**
   * Generate unique record number
   * Format: MR{YYYYMMDD}{HHMMSS}{RANDOM}
   */
  generateRecordNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `MR${year}${month}${day}${hours}${minutes}${seconds}${random}`;
  }

  /**
   * Create a new medical record
   */
  async createMedicalRecord(
    data: MedicalRecordCreateData,
    userId: number,
    req: RequestContext
  ): Promise<MedicalRecordResponse> {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new ApiError('Patient not found', 404);
    }

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
    });

    if (!doctor) {
      throw new ApiError('Doctor not found', 404);
    }

    // Verify department exists if provided
    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });

      if (!department) {
        throw new ApiError('Department not found', 404);
      }
    }

    // Generate unique record number
    const recordNo = this.generateRecordNumber();

    // Create medical record
    const record = await prisma.medicalRecord.create({
      data: {
        recordNo,
        patientId: data.patientId,
        doctorId: data.doctorId,
        departmentId: data.departmentId || null,
        visitType: data.visitType || 'outpatient',
        visitDate: new Date(data.visitDate),
        chiefComplaint: data.chiefComplaint || null,
        presentIllness: data.presentIllness || null,
        physicalExam: data.physicalExam || null,
        diagnosis: data.diagnosis || null,
        treatmentPlan: data.treatmentPlan || null,
        prescription: data.prescription || null,
        notes: data.notes || null,
        status: 'draft',
      },
      include: {
        patient: {
          select: {
            id: true,
            medicalNo: true,
            name: true,
            gender: true,
            birthDate: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log operation
    await this.logOperation(userId, 'medical_record', 'create', record.id, req, {
      recordNo: record.recordNo,
      patientId: record.patientId,
      doctorId: record.doctorId,
    });

    logger.info(`Medical record created: ${record.recordNo} by user ${userId}`);

    return this.formatRecordResponse(record);
  }

  /**
   * Get medical record by ID
   */
  async getMedicalRecordById(id: number): Promise<MedicalRecordResponse> {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            medicalNo: true,
            name: true,
            gender: true,
            birthDate: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        prescriptions: {
          select: {
            id: true,
            medicineName: true,
            specification: true,
            dosage: true,
            frequency: true,
            duration: true,
            quantity: true,
            notes: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            description: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            prescriptions: true,
            attachments: true,
          },
        },
      },
    });

    if (!record) {
      throw new ApiError('Medical record not found', 404);
    }

    return this.formatRecordResponse(record);
  }

  /**
   * Get medical records with pagination and filtering
   */
  async getMedicalRecords(
    filters: MedicalRecordFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ list: MedicalRecordResponse[]; pagination: Pagination }> {
    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.recordNo) {
      where.recordNo = { contains: filters.recordNo };
    }
    if (filters.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters.patientName) {
      where.patient = { name: { contains: filters.patientName } };
    }
    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }
    if (filters.doctorName) {
      where.doctor = { name: { contains: filters.doctorName } };
    }
    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }
    if (filters.visitType) {
      where.visitType = filters.visitType;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      where.visitDate = {};
      if (filters.startDate) {
        (where.visitDate as Record<string, unknown>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.visitDate as Record<string, unknown>).lte = new Date(filters.endDate);
      }
    }

    // Get total count
    const total = await prisma.medicalRecord.count({ where });

    // Calculate pagination
    const { skip, take, totalPages } = calculatePagination(page, pageSize, total);

    // Get records
    const records = await prisma.medicalRecord.findMany({
      where,
      skip,
      take,
      orderBy: { visitDate: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            medicalNo: true,
            name: true,
            gender: true,
            birthDate: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            prescriptions: true,
            attachments: true,
          },
        },
      },
    });

    return {
      list: records.map((r) => this.formatRecordResponse(r)),
      pagination: {
        page,
        pageSize: take,
        total,
        totalPages,
      },
    };
  }

  /**
   * Update medical record
   */
  async updateMedicalRecord(
    id: number,
    data: MedicalRecordUpdateData,
    userId: number,
    req: RequestContext
  ): Promise<MedicalRecordResponse> {
    // Check if record exists
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new ApiError('Medical record not found', 404);
    }

    // Only draft records can be edited
    if (existingRecord.status !== 'draft') {
      throw new ApiError('Only draft records can be edited', 400);
    }

    // Verify patient exists if changing
    if (data.patientId && data.patientId !== existingRecord.patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: data.patientId },
      });

      if (!patient) {
        throw new ApiError('Patient not found', 404);
      }
    }

    // Verify doctor exists if changing
    if (data.doctorId && data.doctorId !== existingRecord.doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: data.doctorId },
      });

      if (!doctor) {
        throw new ApiError('Doctor not found', 404);
      }
    }

    // Verify department exists if changing
    if (data.departmentId && data.departmentId !== existingRecord.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });

      if (!department) {
        throw new ApiError('Department not found', 404);
      }
    }

    // Update record
    const record = await prisma.medicalRecord.update({
      where: { id },
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        departmentId: data.departmentId,
        visitType: data.visitType,
        visitDate: data.visitDate ? new Date(data.visitDate) : undefined,
        chiefComplaint: data.chiefComplaint,
        presentIllness: data.presentIllness,
        physicalExam: data.physicalExam,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        prescription: data.prescription,
        notes: data.notes,
      },
      include: {
        patient: {
          select: {
            id: true,
            medicalNo: true,
            name: true,
            gender: true,
            birthDate: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log operation
    await this.logOperation(userId, 'medical_record', 'update', record.id, req, {
      recordNo: record.recordNo,
      changes: data,
    });

    logger.info(`Medical record updated: ${record.recordNo} by user ${userId}`);

    return this.formatRecordResponse(record);
  }

  /**
   * Update medical record status
   * Status workflow: draft -> confirmed -> archived (no reverse)
   */
  async updateMedicalRecordStatus(
    id: number,
    newStatus: RecordStatus,
    userId: number,
    req: RequestContext
  ): Promise<MedicalRecordResponse> {
    // Check if record exists
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new ApiError('Medical record not found', 404);
    }

    const currentStatus = existingRecord.status as RecordStatus;

    // Validate status transition
    const validTransitions: Record<RecordStatus, RecordStatus[]> = {
      draft: ['confirmed'],
      confirmed: ['archived'],
      archived: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ApiError(
        `Cannot change status from '${currentStatus}' to '${newStatus}'. Valid transitions: ${validTransitions[currentStatus].join(', ') || 'none'}`,
        400
      );
    }

    // Update status
    const record = await prisma.medicalRecord.update({
      where: { id },
      data: { status: newStatus },
      include: {
        patient: {
          select: {
            id: true,
            medicalNo: true,
            name: true,
            gender: true,
            birthDate: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log operation
    await this.logOperation(userId, 'medical_record', 'status_change', record.id, req, {
      recordNo: record.recordNo,
      previousStatus: currentStatus,
      newStatus,
    });

    logger.info(`Medical record status changed: ${record.recordNo} from ${currentStatus} to ${newStatus} by user ${userId}`);

    return this.formatRecordResponse(record);
  }

  /**
   * Delete medical record
   */
  async deleteMedicalRecord(
    id: number,
    userId: number,
    req: RequestContext
  ): Promise<void> {
    // Check if record exists
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new ApiError('Medical record not found', 404);
    }

    // Only draft records can be deleted
    if (record.status !== 'draft') {
      throw new ApiError('Only draft records can be deleted', 400);
    }

    // Delete record (cascades to prescriptions and attachments)
    await prisma.medicalRecord.delete({
      where: { id },
    });

    // Log operation
    await this.logOperation(userId, 'medical_record', 'delete', id, req, {
      recordNo: record.recordNo,
    });

    logger.info(`Medical record deleted: ${record.recordNo} by user ${userId}`);
  }

  /**
   * Get medical record statistics
   */
  async getStatistics(): Promise<MedicalRecordStatistics> {
    // Get total records
    const totalRecords = await prisma.medicalRecord.count();

    // Get records this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const recordsThisMonth = await prisma.medicalRecord.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get status distribution
    const statusGroups = await prisma.medicalRecord.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusDistribution: Record<string, number> = {};
    for (const group of statusGroups) {
      statusDistribution[group.status] = group._count;
    }

    // Get visit type distribution
    const visitTypeGroups = await prisma.medicalRecord.groupBy({
      by: ['visitType'],
      _count: true,
    });

    const visitTypeDistribution: Record<string, number> = {};
    for (const group of visitTypeGroups) {
      visitTypeDistribution[group.visitType || 'unknown'] = group._count;
    }

    // Get department distribution
    const departmentGroups = await prisma.medicalRecord.groupBy({
      by: ['departmentId'],
      _count: true,
      where: {
        departmentId: { not: null },
      },
    });

    const departmentIds = departmentGroups
      .filter((g) => g.departmentId !== null)
      .map((g) => g.departmentId as number);

    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true },
    });

    const departmentMap = new Map(departments.map((d) => [d.id, d.name]));

    const departmentDistribution = departmentGroups
      .filter((g) => g.departmentId !== null)
      .map((g) => ({
        departmentId: g.departmentId as number,
        departmentName: departmentMap.get(g.departmentId as number) || 'Unknown',
        count: g._count,
      }));

    return {
      totalRecords,
      recordsThisMonth,
      statusDistribution,
      visitTypeDistribution,
      departmentDistribution,
    };
  }

  /**
   * Format record response
   */
  private formatRecordResponse(record: {
    id: number;
    recordNo: string;
    patientId: number;
    doctorId: number;
    departmentId: number | null;
    visitType: string | null;
    visitDate: Date;
    chiefComplaint: string | null;
    presentIllness: string | null;
    physicalExam: string | null;
    diagnosis: string | null;
    treatmentPlan: string | null;
    prescription: string | null;
    notes: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    patient?: {
      id: number;
      medicalNo: string;
      name: string;
      gender: string | null;
      birthDate: Date | null;
      phone: string | null;
    };
    doctor?: {
      id: number;
      name: string;
      title: string | null;
    };
    department?: {
      id: number;
      name: string;
    } | null;
    prescriptions?: Array<{
      id: number;
      medicineName: string;
      specification: string | null;
      dosage: string | null;
      frequency: string | null;
      duration: string | null;
      quantity: number | null;
      notes: string | null;
    }>;
    attachments?: Array<{
      id: number;
      fileName: string;
      fileType: string | null;
      fileSize: number | null;
      description: string | null;
      createdAt: Date;
    }>;
    _count?: {
      prescriptions: number;
      attachments: number;
    };
  }): MedicalRecordResponse {
    return {
      id: record.id,
      recordNo: record.recordNo,
      patientId: record.patientId,
      doctorId: record.doctorId,
      departmentId: record.departmentId,
      visitType: record.visitType,
      visitDate: record.visitDate,
      chiefComplaint: record.chiefComplaint,
      presentIllness: record.presentIllness,
      physicalExam: record.physicalExam,
      diagnosis: record.diagnosis,
      treatmentPlan: record.treatmentPlan,
      prescription: record.prescription,
      notes: record.notes,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      patient: record.patient,
      doctor: record.doctor,
      department: record.department,
      prescriptions: record.prescriptions,
      attachments: record.attachments,
      _count: record._count,
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

export const medicalRecordService = new MedicalRecordService();
