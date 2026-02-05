import { Response, NextFunction } from 'express';
import { prescriptionService } from '../services';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils';

export class PrescriptionController {
  /**
   * GET /api/v1/prescriptions/:id
   * Get prescription by ID
   */
  async getPrescriptionById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const prescription = await prescriptionService.getPrescriptionById(parseInt(id, 10));
      sendSuccess(res, prescription, 'Prescription retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/medical-records/:recordId/prescriptions
   * Get prescriptions by medical record ID
   */
  async getPrescriptionsByRecordId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recordId } = req.params;
      const prescriptions = await prescriptionService.getPrescriptionsByRecordId(parseInt(recordId, 10));
      sendSuccess(res, prescriptions, 'Prescriptions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/prescriptions
   * Create new prescription
   */
  async createPrescription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const prescription = await prescriptionService.createPrescription(req.body, req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendCreated(res, prescription, 'Prescription created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/medical-records/:recordId/prescriptions/batch
   * Create multiple prescriptions at once
   */
  async createPrescriptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { recordId } = req.params;
      const { prescriptions } = req.body;

      const createdPrescriptions = await prescriptionService.createPrescriptions(
        parseInt(recordId, 10),
        prescriptions,
        req.user.userId,
        {
          ip: req.ip,
          headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
            'user-agent': req.headers['user-agent'],
          },
        }
      );

      sendCreated(res, createdPrescriptions, 'Prescriptions created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/prescriptions/:id
   * Update prescription
   */
  async updatePrescription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      const prescription = await prescriptionService.updatePrescription(
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

      sendSuccess(res, prescription, 'Prescription updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/prescriptions/:id
   * Delete prescription
   */
  async deletePrescription(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      await prescriptionService.deletePrescription(parseInt(id, 10), req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendSuccess(res, null, 'Prescription deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/medical-records/:recordId/prescriptions
   * Delete all prescriptions for a medical record
   */
  async deletePrescriptionsByRecordId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { recordId } = req.params;
      const count = await prescriptionService.deletePrescriptionsByRecordId(
        parseInt(recordId, 10),
        req.user.userId,
        {
          ip: req.ip,
          headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
            'user-agent': req.headers['user-agent'],
          },
        }
      );

      sendSuccess(res, { deletedCount: count }, 'Prescriptions deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const prescriptionController = new PrescriptionController();
