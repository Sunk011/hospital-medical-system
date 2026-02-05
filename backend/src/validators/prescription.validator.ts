import { body, param } from 'express-validator';

/**
 * Validator for creating a prescription
 */
export const createPrescriptionValidator = [
  body('recordId')
    .notEmpty()
    .withMessage('Record ID is required')
    .isInt({ min: 1 })
    .withMessage('Record ID must be a positive integer'),

  body('medicineName')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Medicine name must be between 1 and 100 characters'),

  body('specification')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Specification must not exceed 100 characters'),

  body('dosage')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Dosage must not exceed 50 characters'),

  body('frequency')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Frequency must not exceed 50 characters'),

  body('duration')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration must not exceed 50 characters'),

  body('quantity')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Notes must not exceed 255 characters'),
];

/**
 * Validator for creating multiple prescriptions
 */
export const createPrescriptionsValidator = [
  param('recordId')
    .isInt({ min: 1 })
    .withMessage('Record ID must be a positive integer'),

  body('prescriptions')
    .isArray({ min: 1 })
    .withMessage('Prescriptions must be a non-empty array'),

  body('prescriptions.*.medicineName')
    .trim()
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Medicine name must be between 1 and 100 characters'),

  body('prescriptions.*.specification')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Specification must not exceed 100 characters'),

  body('prescriptions.*.dosage')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Dosage must not exceed 50 characters'),

  body('prescriptions.*.frequency')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Frequency must not exceed 50 characters'),

  body('prescriptions.*.duration')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration must not exceed 50 characters'),

  body('prescriptions.*.quantity')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('prescriptions.*.notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Notes must not exceed 255 characters'),
];

/**
 * Validator for updating a prescription
 */
export const updatePrescriptionValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Prescription ID must be a positive integer'),

  body('medicineName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medicine name cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Medicine name must be between 1 and 100 characters'),

  body('specification')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Specification must not exceed 100 characters'),

  body('dosage')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Dosage must not exceed 50 characters'),

  body('frequency')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Frequency must not exceed 50 characters'),

  body('duration')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Duration must not exceed 50 characters'),

  body('quantity')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Notes must not exceed 255 characters'),
];

/**
 * Validator for prescription ID parameter
 */
export const prescriptionIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Prescription ID must be a positive integer'),
];

/**
 * Validator for record ID parameter (for getting prescriptions by record)
 */
export const prescriptionRecordIdValidator = [
  param('recordId')
    .isInt({ min: 1 })
    .withMessage('Record ID must be a positive integer'),
];
