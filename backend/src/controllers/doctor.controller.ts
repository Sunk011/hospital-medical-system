import { Response, NextFunction } from 'express';
import { doctorService } from '../services/doctor.service';
import { departmentService } from '../services/department.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendPaginated } from '../utils';

export class DoctorController {
  /**
   * GET /api/v1/doctors
   * Get doctor list with pagination and filtering
   */
  async getDoctors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        pageSize = '10',
        name,
        departmentId,
        title,
        specialty,
        licenseNo,
      } = req.query;

      const result = await doctorService.getDoctors(
        {
          name: name as string | undefined,
          departmentId: departmentId ? parseInt(departmentId as string, 10) : undefined,
          title: title as string | undefined,
          specialty: specialty as string | undefined,
          licenseNo: licenseNo as string | undefined,
        },
        parseInt(page as string, 10),
        parseInt(pageSize as string, 10)
      );

      sendPaginated(res, result.list, result.pagination, 'Doctors retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/doctors/statistics
   * Get doctor statistics
   */
  async getStatistics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const statistics = await doctorService.getStatistics();
      sendSuccess(res, statistics, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/doctors/:id
   * Get doctor by ID
   */
  async getDoctorById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const doctor = await doctorService.getDoctorById(parseInt(id, 10));
      sendSuccess(res, doctor, 'Doctor retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/doctors
   * Create new doctor
   */
  async createDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const doctor = await doctorService.createDoctor(req.body, req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendCreated(res, doctor, 'Doctor created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/doctors/:id
   * Update doctor information
   */
  async updateDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      const doctor = await doctorService.updateDoctor(
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

      sendSuccess(res, doctor, 'Doctor updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/doctors/:id
   * Delete doctor
   */
  async deleteDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      await doctorService.deleteDoctor(parseInt(id, 10), req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendSuccess(res, null, 'Doctor deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/doctors/by-department/:departmentId
   * Get doctors by department (for dropdown)
   */
  async getDoctorsByDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departmentId } = req.params;
      const doctors = await doctorService.getDoctorsByDepartment(parseInt(departmentId, 10));
      sendSuccess(res, doctors, 'Doctors retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export class DepartmentController {
  /**
   * GET /api/v1/departments
   * Get all departments
   */
  async getDepartments(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await departmentService.getDepartments();
      sendSuccess(res, departments, 'Departments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/departments/active
   * Get active departments (for dropdown)
   */
  async getActiveDepartments(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const departments = await departmentService.getActiveDepartments();
      sendSuccess(res, departments, 'Active departments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/departments/:id
   * Get department by ID
   */
  async getDepartmentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const department = await departmentService.getDepartmentById(parseInt(id, 10));
      sendSuccess(res, department, 'Department retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/departments
   * Create a new department
   */
  async createDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = await departmentService.createDepartment(req.body);
      sendCreated(res, department, 'Department created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/departments/:id
   * Update department
   */
  async updateDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const department = await departmentService.updateDepartment(parseInt(id, 10), req.body);
      sendSuccess(res, department, 'Department updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/departments/:id
   * Delete department
   */
  async deleteDepartment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await departmentService.deleteDepartment(parseInt(id, 10));
      sendSuccess(res, null, 'Department deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const doctorController = new DoctorController();
export const departmentController = new DepartmentController();
