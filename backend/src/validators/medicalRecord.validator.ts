import { body, query, param } from 'express-validator';

/**
 * Validator for creating a medical record
 */
export const createMedicalRecordValidator = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a positive integer'),

  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a positive integer'),

  body('departmentId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),

  body('visitType')
    .optional()
    .isIn(['outpatient', 'emergency', 'inpatient'])
    .withMessage('Visit type must be outpatient, emergency, or inpatient'),

  body('visitDate')
    .notEmpty()
    .withMessage('Visit date is required')
    .isISO8601()
    .withMessage('Visit date must be a valid date'),

  body('chiefComplaint')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Chief complaint must not exceed 2000 characters'),

  body('presentIllness')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Present illness must not exceed 5000 characters'),

  body('physicalExam')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Physical exam must not exceed 5000 characters'),

  body('diagnosis')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Diagnosis must not exceed 2000 characters'),

  body('treatmentPlan')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Treatment plan must not exceed 5000 characters'),

  body('prescription')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Prescription must not exceed 5000 characters'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters'),
];

/**
 * Validator for updating a medical record
 */
export const updateMedicalRecordValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Medical record ID must be a positive integer'),

  body('patientId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a positive integer'),

  body('doctorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a positive integer'),

  body('departmentId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),

  body('visitType')
    .optional()
    .isIn(['outpatient', 'emergency', 'inpatient'])
    .withMessage('Visit type must be outpatient, emergency, or inpatient'),

  body('visitDate')
    .optional()
    .isISO8601()
    .withMessage('Visit date must be a valid date'),

  body('chiefComplaint')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Chief complaint must not exceed 2000 characters'),

  body('presentIllness')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Present illness must not exceed 5000 characters'),

  body('physicalExam')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Physical exam must not exceed 5000 characters'),

  body('diagnosis')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Diagnosis must not exceed 2000 characters'),

  body('treatmentPlan')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Treatment plan must not exceed 5000 characters'),

  body('prescription')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Prescription must not exceed 5000 characters'),

  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters'),
];

/**
 * Validator for medical record ID parameter
 */
export const medicalRecordIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Medical record ID must be a positive integer'),
];

/**
 * Validator for medical record list query parameters
 */
export const medicalRecordListValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),

  query('recordNo')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Record number filter must not exceed 30 characters'),

  query('patientId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a positive integer'),

  query('patientName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Patient name filter must not exceed 50 characters'),

  query('doctorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a positive integer'),

  query('doctorName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Doctor name filter must not exceed 50 characters'),

  query('departmentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),

  query('visitType')
    .optional()
    .isIn(['outpatient', 'emergency', 'inpatient'])
    .withMessage('Visit type must be outpatient, emergency, or inpatient'),

  query('status')
    .optional()
    .isIn(['draft', 'confirmed', 'archived'])
    .withMessage('Status must be draft, confirmed, or archived'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

/**
 * Validator for updating medical record status
 */
export const updateMedicalRecordStatusValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Medical record ID must be a positive integer'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'confirmed', 'archived'])
    .withMessage('Status must be draft, confirmed, or archived'),
];
