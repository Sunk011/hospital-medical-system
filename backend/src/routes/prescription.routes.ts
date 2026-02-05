import { Router } from 'express';
import { prescriptionController } from '../controllers';
import { authenticate, validate } from '../middlewares';
import {
  createPrescriptionValidator,
  updatePrescriptionValidator,
  prescriptionIdValidator,
} from '../validators';

const router = Router();

/**
 * @route   GET /api/v1/prescriptions/:id
 * @desc    Get prescription by ID
 * @access  Private
 */
router.get('/:id', authenticate, validate(prescriptionIdValidator), (req, res, next) => {
  prescriptionController.getPrescriptionById(req, res, next);
});

/**
 * @route   POST /api/v1/prescriptions
 * @desc    Create new prescription
 * @access  Private
 */
router.post('/', authenticate, validate(createPrescriptionValidator), (req, res, next) => {
  prescriptionController.createPrescription(req, res, next);
});

/**
 * @route   PUT /api/v1/prescriptions/:id
 * @desc    Update prescription
 * @access  Private
 */
router.put('/:id', authenticate, validate(updatePrescriptionValidator), (req, res, next) => {
  prescriptionController.updatePrescription(req, res, next);
});

/**
 * @route   DELETE /api/v1/prescriptions/:id
 * @desc    Delete prescription
 * @access  Private
 */
router.delete('/:id', authenticate, validate(prescriptionIdValidator), (req, res, next) => {
  prescriptionController.deletePrescription(req, res, next);
});

export default router;
