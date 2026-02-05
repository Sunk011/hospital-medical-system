import { Response, NextFunction } from 'express';
import { patientService } from '../services';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendPaginated } from '../utils';

export class PatientController {
  /**
   * GET /api/v1/patients
   * Get patient list with pagination and filtering
   */
  async getPatients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        pageSize = '10',
        name,
        idCard,
        phone,
        medicalNo,
        gender,
        bloodType,
      } = req.query;

      const result = await patientService.getPatients(
        {
          name: name as string | undefined,
          idCard: idCard as string | undefined,
          phone: phone as string | undefined,
          medicalNo: medicalNo as string | undefined,
          gender: gender as 'M' | 'F' | undefined,
          bloodType: bloodType as 'A' | 'B' | 'AB' | 'O' | 'Unknown' | undefined,
        },
        parseInt(page as string, 10),
        parseInt(pageSize as string, 10)
      );

      sendPaginated(res, result.list, result.pagination, 'Patients retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/patients/statistics
   * Get patient statistics
   */
  async getStatistics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await patientService.getStatistics();
      sendSuccess(res, statistics, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/patients/:id
   * Get patient by ID
   */
  async getPatientById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await patientService.getPatientById(parseInt(id, 10));
      sendSuccess(res, patient, 'Patient retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/patients
   * Create new patient
   */
  async createPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const patient = await patientService.createPatient(req.body, req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendCreated(res, patient, 'Patient created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/patients/:id
   * Update patient information
   */
  async updatePatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      const patient = await patientService.updatePatient(
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

      sendSuccess(res, patient, 'Patient updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/patients/:id
   * Delete patient
   */
  async deletePatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      await patientService.deletePatient(parseInt(id, 10), req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendSuccess(res, null, 'Patient deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/patients/:id/records
   * Get patient's medical records
   */
  async getPatientRecords(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { page = '1', pageSize = '10' } = req.query;

      const result = await patientService.getPatientRecords(
        parseInt(id, 10),
        parseInt(page as string, 10),
        parseInt(pageSize as string, 10)
      );

      sendPaginated(res, result.list, result.pagination, 'Medical records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/patients/:id/history
   * Get patient's medical history summary
   */
  async getPatientHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const history = await patientService.getPatientHistory(parseInt(id, 10));
      sendSuccess(res, history, 'Medical history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const patientController = new PatientController();
