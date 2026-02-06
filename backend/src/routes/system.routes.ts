import { Router } from 'express';
import { systemController } from '../controllers/system.controller';
import { authenticate, authorize, validate } from '../middlewares';
import {
  createUserValidator,
  updateUserValidator,
  resetPasswordValidator,
  userIdParamValidator,
  operationLogQueryValidator,
} from '../validators/system.validator';

const router = Router();

/**
 * @route   GET /api/v1/system/users
 * @desc    Get paginated user list
 * @access  Private (Admin only)
 */
router.get('/users', authenticate, authorize('admin'), (req, res, next) => {
  systemController.getUsers(req, res, next);
});

/**
 * @route   POST /api/v1/system/users
 * @desc    Create a new user
 * @access  Private (Admin only)
 */
router.post('/users', authenticate, authorize('admin'), validate(createUserValidator), (req, res, next) => {
  systemController.createUser(req, res, next);
});

/**
 * @route   PUT /api/v1/system/users/:id
 * @desc    Update user information
 * @access  Private (Admin only)
 */
router.put('/users/:id', authenticate, authorize('admin'), validate(updateUserValidator), (req, res, next) => {
  systemController.updateUser(req, res, next);
});

/**
 * @route   PATCH /api/v1/system/users/:id/status
 * @desc    Toggle user active/inactive status
 * @access  Private (Admin only)
 */
router.patch('/users/:id/status', authenticate, authorize('admin'), validate(userIdParamValidator), (req, res, next) => {
  systemController.toggleUserStatus(req, res, next);
});

/**
 * @route   PATCH /api/v1/system/users/:id/reset-password
 * @desc    Reset user password
 * @access  Private (Admin only)
 */
router.patch('/users/:id/reset-password', authenticate, authorize('admin'), validate(resetPasswordValidator), (req, res, next) => {
  systemController.resetUserPassword(req, res, next);
});

/**
 * @route   GET /api/v1/system/logs
 * @desc    Get paginated operation logs
 * @access  Private (Admin only)
 */
router.get('/logs', authenticate, authorize('admin'), validate(operationLogQueryValidator), (req, res, next) => {
  systemController.getOperationLogs(req, res, next);
});

export default router;
