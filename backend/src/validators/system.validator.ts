import { body, query, param } from 'express-validator';

/**
 * Validator for creating a user
 */
export const createUserValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),

  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must not exceed 20 characters'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'doctor', 'nurse', 'receptionist'])
    .withMessage('Invalid role'),
];

/**
 * Validator for updating a user
 */
export const updateUserValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  body('email')
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),

  body('phone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must not exceed 20 characters'),

  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'nurse', 'receptionist'])
    .withMessage('Invalid role'),
];

/**
 * Validator for resetting user password
 */
export const resetPasswordValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),
];

/**
 * Validator for user ID parameter
 */
export const userIdParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

/**
 * Validator for operation log query parameters
 */
export const operationLogQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Page size must be between 1 and 100'),

  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  query('module')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Module filter must not exceed 50 characters'),

  query('action')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Action filter must not exceed 50 characters'),
];
