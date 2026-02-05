import prisma from '../config/database';
import { ApiError } from '../middlewares';
import { logger, getClientIp, calculatePagination } from '../utils';
import { Pagination } from '../types';

// Patient filter interface
export interface PatientFilters {
  name?: string;
  idCard?: string;
  phone?: string;
  medicalNo?: string;
  gender?: 'M' | 'F';
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'Unknown';
}

// Patient create/update data interface
export interface PatientData {
  name: string;
  idCard?: string | null;
  gender?: 'M' | 'F' | null;
  birthDate?: Date | string | null;
  phone?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  address?: string | null;
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'Unknown' | null;
  allergies?: string | null;
  medicalHistory?: string | null;
}

// Patient response interface
export interface PatientResponse {
  id: number;
  medicalNo: string;
  name: string;
  idCard: string | null;
  gender: string | null;
  birthDate: Date | null;
  age: number | null;
  phone: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  address: string | null;
  bloodType: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  createdAt: Date;
  updatedAt: Date;
  recordsCount?: number;
  lastVisitDate?: Date | null;
}

// Patient statistics interface
export interface PatientStatistics {
  totalPatients: number;
  newPatientsThisMonth: number;
  bloodTypeDistribution: Record<string, number>;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
}

// Request context for logging
interface RequestContext {
  ip?: string;
  headers: { 'x-forwarded-for'?: string; 'user-agent'?: string };
}

export class PatientService {
  /**
   * Generate unique medical number
   * Format: P{YYYYMMDD}{HHMMSS}{RANDOM}
   */
  generateMedicalNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `P${year}${month}${day}${hours}${minutes}${seconds}${random}`;
  }

  /**
   * Calculate age from birth date
   */
  private calculateAge(birthDate: Date | null): number | null {
    if (!birthDate) return null;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Format patient response with calculated fields
   */
  private formatPatientResponse(patient: {
    id: number;
    medicalNo: string;
    name: string;
    idCard: string | null;
    gender: string | null;
    birthDate: Date | null;
    phone: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    address: string | null;
    bloodType: string | null;
    allergies: string | null;
    medicalHistory: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count?: { medicalRecords: number };
    medicalRecords?: Array<{ visitDate: Date }>;
  }): PatientResponse {
    return {
      id: patient.id,
      medicalNo: patient.medicalNo,
      name: patient.name,
      idCard: patient.idCard,
      gender: patient.gender,
      birthDate: patient.birthDate,
      age: this.calculateAge(patient.birthDate),
      phone: patient.phone,
      emergencyContact: patient.emergencyContact,
      emergencyPhone: patient.emergencyPhone,
      address: patient.address,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      recordsCount: patient._count?.medicalRecords,
      lastVisitDate: patient.medicalRecords?.[0]?.visitDate || null,
    };
  }

  /**
   * Create a new patient
   */
  async createPatient(
    data: PatientData,
    userId: number,
    req: RequestContext
  ): Promise<PatientResponse> {
    // Check for duplicate ID card if provided
    if (data.idCard) {
      const existingPatient = await prisma.patient.findUnique({
        where: { idCard: data.idCard },
      });

      if (existingPatient) {
        throw new ApiError('A patient with this ID card already exists', 400);
      }
    }

    // Generate unique medical number
    const medicalNo = this.generateMedicalNumber();

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        medicalNo,
        name: data.name,
        idCard: data.idCard || null,
        gender: data.gender || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        phone: data.phone || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        address: data.address || null,
        bloodType: data.bloodType || 'Unknown',
        allergies: data.allergies || null,
        medicalHistory: data.medicalHistory || null,
      },
    });

    // Log operation
    await this.logOperation(userId, 'patient', 'create', patient.id, req, {
      medicalNo: patient.medicalNo,
      name: patient.name,
    });

    logger.info(`Patient created: ${patient.medicalNo} by user ${userId}`);

    return this.formatPatientResponse(patient);
  }

  /**
   * Get patient by ID
   */
  async getPatientById(id: number): Promise<PatientResponse> {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        _count: {
          select: { medicalRecords: true },
        },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          take: 1,
          select: { visitDate: true },
        },
      },
    });

    if (!patient) {
      throw new ApiError('Patient not found', 404);
    }

    return this.formatPatientResponse(patient);
  }

  /**
   * Get patients with pagination and filtering
   */
  async getPatients(
    filters: PatientFilters,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ list: PatientResponse[]; pagination: Pagination }> {
    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.name) {
      where.name = { contains: filters.name };
    }
    if (filters.idCard) {
      where.idCard = filters.idCard;
    }
    if (filters.phone) {
      where.phone = filters.phone;
    }
    if (filters.medicalNo) {
      where.medicalNo = filters.medicalNo;
    }
    if (filters.gender) {
      where.gender = filters.gender;
    }
    if (filters.bloodType) {
      where.bloodType = filters.bloodType;
    }

    // Get total count
    const total = await prisma.patient.count({ where });

    // Calculate pagination
    const { skip, take, totalPages } = calculatePagination(page, pageSize, total);

    // Get patients
    const patients = await prisma.patient.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { medicalRecords: true },
        },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          take: 1,
          select: { visitDate: true },
        },
      },
    });

    return {
      list: patients.map((p) => this.formatPatientResponse(p)),
      pagination: {
        page,
        pageSize: take,
        total,
        totalPages,
      },
    };
  }

  /**
   * Update patient information
   */
  async updatePatient(
    id: number,
    data: PatientData,
    userId: number,
    req: RequestContext
  ): Promise<PatientResponse> {
    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      throw new ApiError('Patient not found', 404);
    }

    // Check for duplicate ID card if changed
    if (data.idCard && data.idCard !== existingPatient.idCard) {
      const duplicatePatient = await prisma.patient.findUnique({
        where: { idCard: data.idCard },
      });

      if (duplicatePatient) {
        throw new ApiError('A patient with this ID card already exists', 400);
      }
    }

    // Update patient (medical number cannot be changed)
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name: data.name,
        idCard: data.idCard || null,
        gender: data.gender || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        phone: data.phone || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        address: data.address || null,
        bloodType: data.bloodType || 'Unknown',
        allergies: data.allergies || null,
        medicalHistory: data.medicalHistory || null,
      },
    });

    // Log operation
    await this.logOperation(userId, 'patient', 'update', patient.id, req, {
      medicalNo: patient.medicalNo,
      changes: data,
    });

    logger.info(`Patient updated: ${patient.medicalNo} by user ${userId}`);

    return this.formatPatientResponse(patient);
  }

  /**
   * Delete patient (soft delete by checking records)
   */
  async deletePatient(
    id: number,
    userId: number,
    req: RequestContext
  ): Promise<void> {
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        _count: {
          select: { medicalRecords: true },
        },
      },
    });

    if (!patient) {
      throw new ApiError('Patient not found', 404);
    }

    // Check if patient has medical records
    if (patient._count.medicalRecords > 0) {
      throw new ApiError(
        'Cannot delete patient with existing medical records. Please archive the records first.',
        400
      );
    }

    // Delete patient
    await prisma.patient.delete({
      where: { id },
    });

    // Log operation
    await this.logOperation(userId, 'patient', 'delete', id, req, {
      medicalNo: patient.medicalNo,
      name: patient.name,
    });

    logger.info(`Patient deleted: ${patient.medicalNo} by user ${userId}`);
  }

  /**
   * Get patient's medical records
   */
  async getPatientRecords(
    patientId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    list: Array<{
      id: number;
      recordNo: string;
      visitType: string | null;
      visitDate: Date;
      diagnosis: string | null;
      status: string;
      doctor: { id: number; name: string } | null;
      department: { id: number; name: string } | null;
      createdAt: Date;
    }>;
    pagination: Pagination;
  }> {
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new ApiError('Patient not found', 404);
    }

    // Get total count
    const total = await prisma.medicalRecord.count({
      where: { patientId },
    });

    // Calculate pagination
    const { skip, take, totalPages } = calculatePagination(page, pageSize, total);

    // Get records
    const records = await prisma.medicalRecord.findMany({
      where: { patientId },
      skip,
      take,
      orderBy: { visitDate: 'desc' },
      include: {
        doctor: {
          select: { id: true, name: true },
        },
        department: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      list: records.map((r) => ({
        id: r.id,
        recordNo: r.recordNo,
        visitType: r.visitType,
        visitDate: r.visitDate,
        diagnosis: r.diagnosis,
        status: r.status,
        doctor: r.doctor ? { id: r.doctor.id, name: r.doctor.name } : null,
        department: r.department ? { id: r.department.id, name: r.department.name } : null,
        createdAt: r.createdAt,
      })),
      pagination: {
        page,
        pageSize: take,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get patient's medical history summary
   */
  async getPatientHistory(patientId: number): Promise<{
    patient: PatientResponse;
    visitStats: {
      totalVisits: number;
      lastVisitDate: Date | null;
      visitsByType: Record<string, number>;
    };
    recentDiagnoses: string[];
  }> {
    // Get patient with records
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        _count: {
          select: { medicalRecords: true },
        },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
          select: {
            visitDate: true,
            visitType: true,
            diagnosis: true,
          },
        },
      },
    });

    if (!patient) {
      throw new ApiError('Patient not found', 404);
    }

    // Calculate visit statistics
    const visitsByType: Record<string, number> = {};
    const diagnoses: string[] = [];

    for (const record of patient.medicalRecords) {
      const type = record.visitType || 'unknown';
      visitsByType[type] = (visitsByType[type] || 0) + 1;

      if (record.diagnosis && diagnoses.length < 5) {
        diagnoses.push(record.diagnosis);
      }
    }

    return {
      patient: this.formatPatientResponse({
        ...patient,
        medicalRecords: patient.medicalRecords.slice(0, 1),
      }),
      visitStats: {
        totalVisits: patient._count.medicalRecords,
        lastVisitDate: patient.medicalRecords[0]?.visitDate || null,
        visitsByType,
      },
      recentDiagnoses: diagnoses,
    };
  }

  /**
   * Get patient statistics
   */
  async getStatistics(): Promise<PatientStatistics> {
    // Get total patients
    const totalPatients = await prisma.patient.count();

    // Get new patients this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newPatientsThisMonth = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get blood type distribution
    const bloodTypeGroups = await prisma.patient.groupBy({
      by: ['bloodType'],
      _count: true,
    });

    const bloodTypeDistribution: Record<string, number> = {};
    for (const group of bloodTypeGroups) {
      bloodTypeDistribution[group.bloodType || 'Unknown'] = group._count;
    }

    // Get gender distribution
    const genderGroups = await prisma.patient.groupBy({
      by: ['gender'],
      _count: true,
    });

    const genderDistribution: Record<string, number> = {};
    for (const group of genderGroups) {
      genderDistribution[group.gender || 'Unknown'] = group._count;
    }

    // Get age distribution
    const patients = await prisma.patient.findMany({
      select: { birthDate: true },
    });

    const ageDistribution: Record<string, number> = {
      '0-17': 0,
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      '61+': 0,
      'Unknown': 0,
    };

    for (const patient of patients) {
      const age = this.calculateAge(patient.birthDate);
      if (age === null) {
        ageDistribution['Unknown']++;
      } else if (age < 18) {
        ageDistribution['0-17']++;
      } else if (age <= 30) {
        ageDistribution['18-30']++;
      } else if (age <= 45) {
        ageDistribution['31-45']++;
      } else if (age <= 60) {
        ageDistribution['46-60']++;
      } else {
        ageDistribution['61+']++;
      }
    }

    return {
      totalPatients,
      newPatientsThisMonth,
      bloodTypeDistribution,
      ageDistribution,
      genderDistribution,
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

export const patientService = new PatientService();
