import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate, validate } from '../middlewares';
import { loginValidator, changePasswordValidator, refreshTokenValidator } from '../validators';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', validate(loginValidator), (req, res, next) => {
  authController.login(req, res, next);
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', authenticate, (req, res, next) => {
  authController.logout(req, res, next);
});

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, (req, res, next) => {
  authController.getProfile(req, res, next);
});

/**
 * @route   PUT /api/v1/auth/password
 * @desc    Change user password
 * @access  Private
 */
router.put('/password', authenticate, validate(changePasswordValidator), (req, res, next) => {
  authController.changePassword(req, res, next);
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenValidator), (req, res, next) => {
  authController.refreshToken(req, res, next);
});

export default router;
