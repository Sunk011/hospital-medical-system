import { Response, NextFunction } from 'express';
import { systemService } from '../services/system.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendPaginated } from '../utils';

export class SystemController {
  /**
   * GET /api/v1/system/users
   * Get paginated user list
   */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', pageSize = '10', search, role, status } = req.query;
      const result = await systemService.getUsers(
        {
          search: search as string | undefined,
          role: role as string | undefined,
          status: status as string | undefined,
        },
        parseInt(page as string, 10),
        parseInt(pageSize as string, 10)
      );
      sendPaginated(res, result.list, result.pagination, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/system/users
   * Create a new user
   */
  async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await systemService.createUser(req.body);
      sendCreated(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/system/users/:id
   * Update user information
   */
  async updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await systemService.updateUser(parseInt(id, 10), req.body);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/system/users/:id/status
   * Toggle user active/inactive status
   */
  async toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await systemService.toggleUserStatus(parseInt(id, 10));
      sendSuccess(res, user, 'User status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/system/users/:id/reset-password
   * Reset user password
   */
  async resetUserPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      await systemService.resetUserPassword(parseInt(id, 10), newPassword);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/system/logs
   * Get paginated operation logs
   */
  async getOperationLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', pageSize = '10', userId, module, action, startDate, endDate } = req.query;
      const result = await systemService.getOperationLogs(
        {
          userId: userId ? parseInt(userId as string, 10) : undefined,
          module: module as string | undefined,
          action: action as string | undefined,
          startDate: startDate as string | undefined,
          endDate: endDate as string | undefined,
        },
        parseInt(page as string, 10),
        parseInt(pageSize as string, 10)
      );
      sendPaginated(res, result.list, result.pagination, 'Operation logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();
