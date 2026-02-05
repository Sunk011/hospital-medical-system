import { Response, NextFunction } from 'express';
import { authService } from '../services';
import { AuthRequest, LoginRequest } from '../types';
import { sendSuccess, sendError } from '../utils';

export class AuthController {
  /**
   * POST /api/v1/auth/login
   * User login
   */
  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body as LoginRequest;

      const result = await authService.login(username, password, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * User logout
   */
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      await authService.logout(req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/profile
   * Get current user profile
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const user = await authService.getProfile(req.user.userId);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/auth/password
   * Change user password
   */
  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(req.user.userId, currentPassword, newPassword, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const tokens = await authService.refreshToken(refreshToken);
      sendSuccess(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
