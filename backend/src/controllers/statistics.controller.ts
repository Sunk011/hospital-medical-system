import { Response, NextFunction } from 'express';
import { statisticsService } from '../services/statistics.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils';

export class StatisticsController {
  /**
   * GET /api/v1/statistics/dashboard
   * Get dashboard statistics
   */
  async getDashboardStatistics(
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statistics = await statisticsService.getDashboardStatistics();
      sendSuccess(res, statistics, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/statistics/visits
   * Get visit statistics
   */
  async getVisitStatistics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const statistics = await statisticsService.getVisitStatistics({
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      sendSuccess(res, statistics, 'Visit statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/statistics/visits/trend
   * Get visit trend data
   */
  async getVisitTrend(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const trend = await statisticsService.getVisitTrend({
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      sendSuccess(res, trend, 'Visit trend data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/statistics/departments
   * Get department statistics
   */
  async getDepartmentStatistics(
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statistics = await statisticsService.getDepartmentStatistics();
      sendSuccess(res, statistics, 'Department statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/statistics/doctors
   * Get doctor statistics
   */
  async getDoctorStatistics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { limit = '10' } = req.query;
      const statistics = await statisticsService.getDoctorStatistics(
        parseInt(limit as string, 10)
      );
      sendSuccess(res, statistics, 'Doctor statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/statistics/patients
   * Get patient statistics
   */
  async getPatientStatistics(
    _req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statistics = await statisticsService.getPatientStatistics();
      sendSuccess(res, statistics, 'Patient statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/statistics/diseases
   * Get disease statistics
   */
  async getDiseaseStatistics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, limit = '10' } = req.query;
      const statistics = await statisticsService.getDiseaseStatistics(
        {
          startDate: startDate as string | undefined,
          endDate: endDate as string | undefined,
        },
        parseInt(limit as string, 10)
      );
      sendSuccess(res, statistics, 'Disease statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/statistics/prescriptions
   * Get prescription statistics
   */
  async getPrescriptionStatistics(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const statistics = await statisticsService.getPrescriptionStatistics({
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      sendSuccess(res, statistics, 'Prescription statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/statistics/report
   * Generate comprehensive report
   */
  async generateReport(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const report = await statisticsService.generateReport({
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });
      sendSuccess(res, report, 'Report generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const statisticsController = new StatisticsController();
