import { Router } from 'express';
import { departmentController } from '../controllers/doctor.controller';
import { authenticate, authorize, validate } from '../middlewares';
import {
  createDepartmentValidator,
  updateDepartmentValidator,
  departmentIdParamValidator,
} from '../validators/department.validator';

const router = Router();

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

/**
 * @route   POST /api/v1/departments
 * @desc    Create a new department
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorize('admin'), validate(createDepartmentValidator), (req, res, next) => {
  departmentController.createDepartment(req, res, next);
});

/**
 * @route   PUT /api/v1/departments/:id
 * @desc    Update department
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, authorize('admin'), validate(updateDepartmentValidator), (req, res, next) => {
  departmentController.updateDepartment(req, res, next);
});

/**
 * @route   DELETE /api/v1/departments/:id
 * @desc    Delete department
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), validate(departmentIdParamValidator), (req, res, next) => {
  departmentController.deleteDepartment(req, res, next);
});

export default router;
