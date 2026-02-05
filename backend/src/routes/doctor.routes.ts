import { Router } from 'express';
import { doctorController } from '../controllers/doctor.controller';
import { authenticate, authorize, validate } from '../middlewares';
import {
  createDoctorValidator,
  updateDoctorValidator,
  doctorIdValidator,
  doctorListValidator,
  departmentIdValidator,
} from '../validators/doctor.validator';

const router = Router();

/**
 * @route   GET /api/v1/doctors/statistics
 * @desc    Get doctor statistics
 * @access  Private
 */
router.get('/statistics', authenticate, (req, res, next) => {
  doctorController.getStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/doctors/by-department/:departmentId
 * @desc    Get doctors by department (for dropdown)
 * @access  Private
 */
router.get('/by-department/:departmentId', authenticate, validate(departmentIdValidator), (req, res, next) => {
  doctorController.getDoctorsByDepartment(req, res, next);
});

/**
 * @route   GET /api/v1/doctors
 * @desc    Get doctor list with pagination and filtering
 * @access  Private
 */
router.get('/', authenticate, validate(doctorListValidator), (req, res, next) => {
  doctorController.getDoctors(req, res, next);
});

/**
 * @route   GET /api/v1/doctors/:id
 * @desc    Get doctor by ID
 * @access  Private
 */
router.get('/:id', authenticate, validate(doctorIdValidator), (req, res, next) => {
  doctorController.getDoctorById(req, res, next);
});

/**
 * @route   POST /api/v1/doctors
 * @desc    Create new doctor
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorize('admin'), validate(createDoctorValidator), (req, res, next) => {
  doctorController.createDoctor(req, res, next);
});

/**
 * @route   PUT /api/v1/doctors/:id
 * @desc    Update doctor information
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, authorize('admin'), validate(updateDoctorValidator), (req, res, next) => {
  doctorController.updateDoctor(req, res, next);
});

/**
 * @route   DELETE /api/v1/doctors/:id
 * @desc    Delete doctor
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), validate(doctorIdValidator), (req, res, next) => {
  doctorController.deleteDoctor(req, res, next);
});

export default router;
