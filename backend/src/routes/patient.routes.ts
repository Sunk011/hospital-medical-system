import { Router } from 'express';
import { patientController } from '../controllers';
import { authenticate, validate } from '../middlewares';
import {
  createPatientValidator,
  updatePatientValidator,
  patientIdValidator,
  patientListValidator,
  patientRecordsValidator,
} from '../validators';

const router = Router();

/**
 * @route   GET /api/v1/patients/statistics
 * @desc    Get patient statistics
 * @access  Private
 */
router.get('/statistics', authenticate, (req, res, next) => {
  patientController.getStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/patients
 * @desc    Get patient list with pagination and filtering
 * @access  Private
 */
router.get('/', authenticate, validate(patientListValidator), (req, res, next) => {
  patientController.getPatients(req, res, next);
});

/**
 * @route   GET /api/v1/patients/:id
 * @desc    Get patient by ID
 * @access  Private
 */
router.get('/:id', authenticate, validate(patientIdValidator), (req, res, next) => {
  patientController.getPatientById(req, res, next);
});

/**
 * @route   POST /api/v1/patients
 * @desc    Create new patient
 * @access  Private
 */
router.post('/', authenticate, validate(createPatientValidator), (req, res, next) => {
  patientController.createPatient(req, res, next);
});

/**
 * @route   PUT /api/v1/patients/:id
 * @desc    Update patient information
 * @access  Private
 */
router.put('/:id', authenticate, validate(updatePatientValidator), (req, res, next) => {
  patientController.updatePatient(req, res, next);
});

/**
 * @route   DELETE /api/v1/patients/:id
 * @desc    Delete patient
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, validate(patientIdValidator), (req, res, next) => {
  patientController.deletePatient(req, res, next);
});

/**
 * @route   GET /api/v1/patients/:id/records
 * @desc    Get patient's medical records
 * @access  Private
 */
router.get('/:id/records', authenticate, validate(patientRecordsValidator), (req, res, next) => {
  patientController.getPatientRecords(req, res, next);
});

/**
 * @route   GET /api/v1/patients/:id/history
 * @desc    Get patient's medical history summary
 * @access  Private
 */
router.get('/:id/history', authenticate, validate(patientIdValidator), (req, res, next) => {
  patientController.getPatientHistory(req, res, next);
});

export default router;
