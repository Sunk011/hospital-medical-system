import { Router } from 'express';
import { departmentController } from '../controllers/doctor.controller';
import { authenticate, validate } from '../middlewares';
import { param } from 'express-validator';

const router = Router();

// Validator for department ID
const departmentIdParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),
];

/**
 * @route   GET /api/v1/departments/active
 * @desc    Get active departments (for dropdown)
 * @access  Private
 */
router.get('/active', authenticate, (req, res, next) => {
  departmentController.getActiveDepartments(req, res, next);
});

/**
 * @route   GET /api/v1/departments
 * @desc    Get all departments
 * @access  Private
 */
router.get('/', authenticate, (req, res, next) => {
  departmentController.getDepartments(req, res, next);
});

/**
 * @route   GET /api/v1/departments/:id
 * @desc    Get department by ID
 * @access  Private
 */
router.get('/:id', authenticate, validate(departmentIdParamValidator), (req, res, next) => {
  departmentController.getDepartmentById(req, res, next);
});

export default router;
