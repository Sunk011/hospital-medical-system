import prisma from '../config/database';
import { ApiError } from '../middlewares';
import { logger, getClientIp } from '../utils';

// Prescription create data interface
export interface PrescriptionCreateData {
  recordId: number;
  medicineName: string;
  specification?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  quantity?: number | null;
  notes?: string | null;
}

// Prescription update data interface
export interface PrescriptionUpdateData {
  medicineName?: string;
  specification?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  quantity?: number | null;
  notes?: string | null;
}

// Prescription response interface
export interface PrescriptionResponse {
  id: number;
  recordId: number;
  medicineName: string;
  specification: string | null;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  quantity: number | null;
  notes: string | null;
  createdAt: Date;
}

// Request context for logging
interface RequestContext {
  ip?: string;
  headers: { 'x-forwarded-for'?: string; 'user-agent'?: string };
}

export class PrescriptionService {
  /**
   * Create a new prescription
   */
  async createPrescription(
    data: PrescriptionCreateData,
    userId: number,
    req: RequestContext
  ): Promise<PrescriptionResponse> {
    // Verify medical record exists and is in draft status
    const record = await prisma.medicalRecord.findUnique({
      where: { id: data.recordId },
    });

    if (!record) {
      throw new ApiError('Medical record not found', 404);
    }

    if (record.status !== 'draft') {
      throw new ApiError('Can only add prescriptions to draft records', 400);
    }

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        recordId: data.recordId,
        medicineName: data.medicineName,
        specification: data.specification || null,
        dosage: data.dosage || null,
        frequency: data.frequency || null,
        duration: data.duration || null,
        quantity: data.quantity || null,
        notes: data.notes || null,
      },
    });

    // Log operation
    await this.logOperation(userId, 'prescription', 'create', prescription.id, req, {
      recordId: data.recordId,
      medicineName: data.medicineName,
    });

    logger.info(`Prescription created for record ${data.recordId} by user ${userId}`);

    return this.formatPrescriptionResponse(prescription);
  }

  /**
   * Create multiple prescriptions at once
   */
  async createPrescriptions(
    recordId: number,
    prescriptions: Omit<PrescriptionCreateData, 'recordId'>[],
    userId: number,
    req: RequestContext
  ): Promise<PrescriptionResponse[]> {
    // Verify medical record exists and is in draft status
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new ApiError('Medical record not found', 404);
    }

    if (record.status !== 'draft') {
      throw new ApiError('Can only add prescriptions to draft records', 400);
    }

    // Create prescriptions
    const createdPrescriptions: PrescriptionResponse[] = [];

    for (const prescriptionData of prescriptions) {
      const prescription = await prisma.prescription.create({
        data: {
          recordId,
          medicineName: prescriptionData.medicineName,
          specification: prescriptionData.specification || null,
          dosage: prescriptionData.dosage || null,
          frequency: prescriptionData.frequency || null,
          duration: prescriptionData.duration || null,
          quantity: prescriptionData.quantity || null,
          notes: prescriptionData.notes || null,
        },
      });

      createdPrescriptions.push(this.formatPrescriptionResponse(prescription));
    }

    // Log operation
    await this.logOperation(userId, 'prescription', 'batch_create', recordId, req, {
      recordId,
      count: prescriptions.length,
    });

    logger.info(`${prescriptions.length} prescriptions created for record ${recordId} by user ${userId}`);

    return createdPrescriptions;
  }

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(id: number): Promise<PrescriptionResponse> {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new ApiError('Prescription not found', 404);
    }

    return this.formatPrescriptionResponse(prescription);
  }

  /**
   * Get prescriptions by medical record ID
   */
  async getPrescriptionsByRecordId(recordId: number): Promise<PrescriptionResponse[]> {
    // Verify medical record exists
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new ApiError('Medical record not found', 404);
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { recordId },
      orderBy: { createdAt: 'asc' },
    });

    return prescriptions.map((p) => this.formatPrescriptionResponse(p));
  }

  /**
   * Update prescription
   */
  async updatePrescription(
    id: number,
    data: PrescriptionUpdateData,
    userId: number,
    req: RequestContext
  ): Promise<PrescriptionResponse> {
    // Check if prescription exists
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          select: { status: true },
        },
      },
    });

    if (!existingPrescription) {
      throw new ApiError('Prescription not found', 404);
    }

    // Check if medical record is in draft status
    if (existingPrescription.medicalRecord.status !== 'draft') {
      throw new ApiError('Can only update prescriptions in draft records', 400);
    }

    // Update prescription
    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        medicineName: data.medicineName,
        specification: data.specification,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        quantity: data.quantity,
        notes: data.notes,
      },
    });

    // Log operation
    await this.logOperation(userId, 'prescription', 'update', prescription.id, req, {
      recordId: prescription.recordId,
      changes: data,
    });

    logger.info(`Prescription ${id} updated by user ${userId}`);

    return this.formatPrescriptionResponse(prescription);
  }

  /**
   * Delete prescription
   */
  async deletePrescription(
    id: number,
    userId: number,
    req: RequestContext
  ): Promise<void> {
    // Check if prescription exists
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          select: { status: true, recordNo: true },
        },
      },
    });

    if (!prescription) {
      throw new ApiError('Prescription not found', 404);
    }

    // Check if medical record is in draft status
    if (prescription.medicalRecord.status !== 'draft') {
      throw new ApiError('Can only delete prescriptions from draft records', 400);
    }

    // Delete prescription
    await prisma.prescription.delete({
      where: { id },
    });

    // Log operation
    await this.logOperation(userId, 'prescription', 'delete', id, req, {
      recordId: prescription.recordId,
      medicineName: prescription.medicineName,
    });

    logger.info(`Prescription ${id} deleted by user ${userId}`);
  }

  /**
   * Delete all prescriptions for a medical record
   */
  async deletePrescriptionsByRecordId(
    recordId: number,
    userId: number,
    req: RequestContext
  ): Promise<number> {
    // Verify medical record exists and is in draft status
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new ApiError('Medical record not found', 404);
    }

    if (record.status !== 'draft') {
      throw new ApiError('Can only delete prescriptions from draft records', 400);
    }

    // Delete all prescriptions
    const result = await prisma.prescription.deleteMany({
      where: { recordId },
    });

    // Log operation
    await this.logOperation(userId, 'prescription', 'batch_delete', recordId, req, {
      recordId,
      count: result.count,
    });

    logger.info(`${result.count} prescriptions deleted for record ${recordId} by user ${userId}`);

    return result.count;
  }

  /**
   * Format prescription response
   */
  private formatPrescriptionResponse(prescription: {
    id: number;
    recordId: number;
    medicineName: string;
    specification: string | null;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    quantity: number | null;
    notes: string | null;
    createdAt: Date;
  }): PrescriptionResponse {
    return {
      id: prescription.id,
      recordId: prescription.recordId,
      medicineName: prescription.medicineName,
      specification: prescription.specification,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      quantity: prescription.quantity,
      notes: prescription.notes,
      createdAt: prescription.createdAt,
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

export const prescriptionService = new PrescriptionService();
