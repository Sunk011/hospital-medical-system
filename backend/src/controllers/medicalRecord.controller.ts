import { Response, NextFunction } from 'express';
import { medicalRecordService } from '../services';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendPaginated } from '../utils';
import type { RecordStatus } from '../services/medicalRecord.service';

export class MedicalRecordController {
  /**
   * GET /api/v1/medical-records
   * Get medical record list with pagination and filtering
   */
  async getMedicalRecords(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        pageSize = '10',
        recordNo,
        patientId,
        patientName,
        doctorId,
        doctorName,
        departmentId,
        visitType,
        status,
        startDate,
        endDate,
      } = req.query;

      const result = await medicalRecordService.getMedicalRecords(
        {
          recordNo: recordNo as string | undefined,
          patientId: patientId ? parseInt(patientId as string, 10) : undefined,
          patientName: patientName as string | undefined,
          doctorId: doctorId ? parseInt(doctorId as string, 10) : undefined,
          doctorName: doctorName as string | undefined,
          departmentId: departmentId ? parseInt(departmentId as string, 10) : undefined,
          visitType: visitType as 'outpatient' | 'emergency' | 'inpatient' | undefined,
          status: status as 'draft' | 'confirmed' | 'archived' | undefined,
          startDate: startDate as string | undefined,
          endDate: endDate as string | undefined,
        },
        parseInt(page as string, 10),
        parseInt(pageSize as string, 10)
      );

      sendPaginated(res, result.list, result.pagination, 'Medical records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/medical-records/statistics
   * Get medical record statistics
   */
  async getStatistics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await medicalRecordService.getStatistics();
      sendSuccess(res, statistics, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/medical-records/:id
   * Get medical record by ID
   */
  async getMedicalRecordById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const record = await medicalRecordService.getMedicalRecordById(parseInt(id, 10));
      sendSuccess(res, record, 'Medical record retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/medical-records
   * Create new medical record
   */
  async createMedicalRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const record = await medicalRecordService.createMedicalRecord(req.body, req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendCreated(res, record, 'Medical record created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/medical-records/:id
   * Update medical record
   */
  async updateMedicalRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      const record = await medicalRecordService.updateMedicalRecord(
        parseInt(id, 10),
        req.body,
        req.user.userId,
        {
          ip: req.ip,
          headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
            'user-agent': req.headers['user-agent'],
          },
        }
      );

      sendSuccess(res, record, 'Medical record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/medical-records/:id/status
   * Update medical record status
   */
  async updateMedicalRecordStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      const record = await medicalRecordService.updateMedicalRecordStatus(
        parseInt(id, 10),
        status as RecordStatus,
        req.user.userId,
        {
          ip: req.ip,
          headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
            'user-agent': req.headers['user-agent'],
          },
        }
      );

      sendSuccess(res, record, 'Medical record status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/medical-records/:id
   * Delete medical record
   */
  async deleteMedicalRecord(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      await medicalRecordService.deleteMedicalRecord(parseInt(id, 10), req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendSuccess(res, null, 'Medical record deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const medicalRecordController = new MedicalRecordController();
