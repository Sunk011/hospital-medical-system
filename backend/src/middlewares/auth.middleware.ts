import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { AuthRequest, JwtPayload } from '../types';
import { sendError } from '../utils/response';
import { UserRole } from '@prisma/client';

/**
 * Authentication middleware - verifies JWT token
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      sendError(res, 'No authorization header provided', 401);
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      sendError(res, 'Invalid authorization header format', 401);
      return;
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        sendError(res, 'Token has expired', 401);
        return;
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        sendError(res, 'Invalid token', 401);
        return;
      }
      throw jwtError;
    }
  } catch (error) {
    sendError(res, 'Authentication failed', 401);
  }
}

/**
 * Authorization middleware - checks user role
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'User not authenticated', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
}

/**
 * Optional authentication - attaches user if token present, but doesn't require it
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    next();
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    req.user = decoded;
  } catch {
    // Token invalid, but we continue without user
  }

  next();
}
