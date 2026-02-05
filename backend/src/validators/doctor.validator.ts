import { body, query, param } from 'express-validator';

/**
 * Validate medical license number format
 * Format: Letters and numbers, 5-50 characters
 */
const isValidLicenseNo = (value: string): boolean => {
  if (!value) return true; // Optional field
  const licenseRegex = /^[A-Za-z0-9-]{5,50}$/;
  return licenseRegex.test(value);
};

/**
 * Validator for creating a doctor
 */
export const createDoctorValidator = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[\u4e00-\u9fa5a-zA-Z\s]+$/)
    .withMessage('Name can only contain Chinese characters, English letters, and spaces'),

  body('departmentId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),

  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Title must not exceed 50 characters'),

  body('specialty')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Specialty must not exceed 200 characters'),

  body('licenseNo')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && !isValidLicenseNo(value)) {
        throw new Error('Invalid license number format. Must be 5-50 alphanumeric characters');
      }
      return true;
    }),

  body('introduction')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Introduction must not exceed 2000 characters'),
];

/**
 * Validator for updating a doctor
 */
export const updateDoctorValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a positive integer'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[\u4e00-\u9fa5a-zA-Z\s]+$/)
    .withMessage('Name can only contain Chinese characters, English letters, and spaces'),

  body('departmentId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),

  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Title must not exceed 50 characters'),

  body('specialty')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Specialty must not exceed 200 characters'),

  body('licenseNo')
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (value && !isValidLicenseNo(value)) {
        throw new Error('Invalid license number format. Must be 5-50 alphanumeric characters');
      }
      return true;
    }),

  body('introduction')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Introduction must not exceed 2000 characters'),
];

/**
 * Validator for doctor ID parameter
 */
export const doctorIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a positive integer'),
];

/**
 * Validator for doctor list query parameters
 */
export const doctorListValidator = [
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

  query('departmentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),

  query('title')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Title filter must not exceed 50 characters'),

  query('specialty')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Specialty filter must not exceed 200 characters'),

  query('licenseNo')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('License number filter must not exceed 50 characters'),
];

/**
 * Validator for department ID parameter
 */
export const departmentIdValidator = [
  param('departmentId')
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),
];
