import { body, query, param } from 'express-validator';

/**
 * Validate Chinese ID card format (18 digits, last can be X)
 */
const isValidIdCard = (value: string): boolean => {
  if (!value) return true; // Optional field
  const idCardRegex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return idCardRegex.test(value);
};

/**
 * Validate Chinese phone number format (11 digits starting with 1)
 */
const isValidPhone = (value: string): boolean => {
  if (!value) return true; // Optional field
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(value);
};

/**
 * Validator for creating a patient
 */
export const createPatientValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[\u4e00-\u9fa5a-zA-Z\s]+$/)
    .withMessage('Name can only contain Chinese characters, English letters, and spaces'),

  body('idCard')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && !isValidIdCard(value)) {
        throw new Error('Invalid ID card format. Must be 18 digits (last digit can be X)');
      }
      return true;
    }),

  body('gender')
    .optional({ nullable: true })
    .isIn(['M', 'F'])
    .withMessage('Gender must be M (Male) or F (Female)'),

  body('birthDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Birth date must be a valid date')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Birth date cannot be in the future');
      }
      return true;
    }),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && !isValidPhone(value)) {
        throw new Error('Invalid phone number format. Must be 11 digits starting with 1');
      }
      return true;
    }),

  body('emergencyContact')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Emergency contact name must not exceed 50 characters'),

  body('emergencyPhone')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && !isValidPhone(value)) {
        throw new Error('Invalid emergency phone format. Must be 11 digits starting with 1');
      }
      return true;
    }),

  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters'),

  body('bloodType')
    .optional({ nullable: true })
    .isIn(['A', 'B', 'AB', 'O', 'Unknown'])
    .withMessage('Blood type must be A, B, AB, O, or Unknown'),

  body('allergies')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Allergies must not exceed 1000 characters'),

  body('medicalHistory')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Medical history must not exceed 2000 characters'),
];

/**
 * Validator for updating a patient
 */
export const updatePatientValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a positive integer'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[\u4e00-\u9fa5a-zA-Z\s]+$/)
    .withMessage('Name can only contain Chinese characters, English letters, and spaces'),

  body('idCard')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && !isValidIdCard(value)) {
        throw new Error('Invalid ID card format. Must be 18 digits (last digit can be X)');
      }
      return true;
    }),

  body('gender')
    .optional({ nullable: true })
    .isIn(['M', 'F'])
    .withMessage('Gender must be M (Male) or F (Female)'),

  body('birthDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Birth date must be a valid date')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Birth date cannot be in the future');
      }
      return true;
    }),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && !isValidPhone(value)) {
        throw new Error('Invalid phone number format. Must be 11 digits starting with 1');
      }
      return true;
    }),

  body('emergencyContact')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Emergency contact name must not exceed 50 characters'),

  body('emergencyPhone')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && !isValidPhone(value)) {
        throw new Error('Invalid emergency phone format. Must be 11 digits starting with 1');
      }
      return true;
    }),

  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters'),

  body('bloodType')
    .optional({ nullable: true })
    .isIn(['A', 'B', 'AB', 'O', 'Unknown'])
    .withMessage('Blood type must be A, B, AB, O, or Unknown'),

  body('allergies')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Allergies must not exceed 1000 characters'),

  body('medicalHistory')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Medical history must not exceed 2000 characters'),
];

/**
 * Validator for patient ID parameter
 */
export const patientIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a positive integer'),
];

/**
 * Validator for patient list query parameters
 */
export const patientListValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),

  query('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name filter must not exceed 50 characters'),

  query('idCard')
    .optional()
    .trim()
    .isLength({ max: 18 })
    .withMessage('ID card filter must not exceed 18 characters'),

  query('phone')
    .optional()
    .trim()
    .isLength({ max: 11 })
    .withMessage('Phone filter must not exceed 11 characters'),

  query('medicalNo')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Medical number filter must not exceed 20 characters'),

  query('gender')
    .optional()
    .isIn(['M', 'F'])
    .withMessage('Gender filter must be M or F'),

  query('bloodType')
    .optional()
    .isIn(['A', 'B', 'AB', 'O', 'Unknown'])
    .withMessage('Blood type filter must be A, B, AB, O, or Unknown'),
];

/**
 * Validator for patient records query parameters
 */
export const patientRecordsValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a positive integer'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),
];
