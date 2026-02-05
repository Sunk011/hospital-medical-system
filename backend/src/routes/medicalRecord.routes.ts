import { Router } from 'express';
import { medicalRecordController, prescriptionController, attachmentController } from '../controllers';
import { authenticate, validate, upload, handleMulterError } from '../middlewares';
import {
  createMedicalRecordValidator,
  updateMedicalRecordValidator,
  medicalRecordIdValidator,
  medicalRecordListValidator,
  updateMedicalRecordStatusValidator,
  prescriptionRecordIdValidator,
  createPrescriptionsValidator,
  attachmentRecordIdValidator,
  uploadAttachmentValidator,
} from '../validators';
import { Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * @route   GET /api/v1/medical-records/statistics
 * @desc    Get medical record statistics
 * @access  Private
 */
router.get('/statistics', authenticate, (req, res, next) => {
  medicalRecordController.getStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/medical-records
 * @desc    Get medical record list with pagination and filtering
 * @access  Private
 */
router.get('/', authenticate, validate(medicalRecordListValidator), (req, res, next) => {
  medicalRecordController.getMedicalRecords(req, res, next);
});

/**
 * @route   GET /api/v1/medical-records/:id
 * @desc    Get medical record by ID
 * @access  Private
 */
router.get('/:id', authenticate, validate(medicalRecordIdValidator), (req, res, next) => {
  medicalRecordController.getMedicalRecordById(req, res, next);
});

/**
 * @route   POST /api/v1/medical-records
 * @desc    Create new medical record
 * @access  Private
 */
router.post('/', authenticate, validate(createMedicalRecordValidator), (req, res, next) => {
  medicalRecordController.createMedicalRecord(req, res, next);
});

/**
 * @route   PUT /api/v1/medical-records/:id
 * @desc    Update medical record
 * @access  Private
 */
router.put('/:id', authenticate, validate(updateMedicalRecordValidator), (req, res, next) => {
  medicalRecordController.updateMedicalRecord(req, res, next);
});

/**
 * @route   PATCH /api/v1/medical-records/:id/status
 * @desc    Update medical record status
 * @access  Private
 */
router.patch('/:id/status', authenticate, validate(updateMedicalRecordStatusValidator), (req, res, next) => {
  medicalRecordController.updateMedicalRecordStatus(req, res, next);
});

/**
 * @route   DELETE /api/v1/medical-records/:id
 * @desc    Delete medical record (only draft)
 * @access  Private
 */
router.delete('/:id', authenticate, validate(medicalRecordIdValidator), (req, res, next) => {
  medicalRecordController.deleteMedicalRecord(req, res, next);
});

// ==================== Prescription Routes ====================

/**
 * @route   GET /api/v1/medical-records/:recordId/prescriptions
 * @desc    Get prescriptions by medical record ID
 * @access  Private
 */
router.get('/:recordId/prescriptions', authenticate, validate(prescriptionRecordIdValidator), (req, res, next) => {
  prescriptionController.getPrescriptionsByRecordId(req, res, next);
});

/**
 * @route   POST /api/v1/medical-records/:recordId/prescriptions/batch
 * @desc    Create multiple prescriptions at once
 * @access  Private
 */
router.post('/:recordId/prescriptions/batch', authenticate, validate(createPrescriptionsValidator), (req, res, next) => {
  prescriptionController.createPrescriptions(req, res, next);
});

/**
 * @route   DELETE /api/v1/medical-records/:recordId/prescriptions
 * @desc    Delete all prescriptions for a medical record
 * @access  Private
 */
router.delete('/:recordId/prescriptions', authenticate, validate(prescriptionRecordIdValidator), (req, res, next) => {
  prescriptionController.deletePrescriptionsByRecordId(req, res, next);
});

// ==================== Attachment Routes ====================

/**
 * @route   GET /api/v1/medical-records/:recordId/attachments
 * @desc    Get attachments by medical record ID
 * @access  Private
 */
router.get('/:recordId/attachments', authenticate, validate(attachmentRecordIdValidator), (req, res, next) => {
  attachmentController.getAttachmentsByRecordId(req, res, next);
});

/**
 * @route   POST /api/v1/medical-records/:recordId/attachments
 * @desc    Upload attachment for a medical record
 * @access  Private
 */
router.post(
  '/:recordId/attachments',
  authenticate,
  validate(uploadAttachmentValidator),
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        next(handleMulterError(err));
        return;
      }
      next();
    });
  },
  (req, res, next) => {
    attachmentController.uploadAttachment(req, res, next);
  }
);

export default router;
