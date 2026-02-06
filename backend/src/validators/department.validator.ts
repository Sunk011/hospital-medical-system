import { body, param } from 'express-validator';

/**
 * Validator for creating a department
 */
export const createDepartmentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('code')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Code must be between 2 and 20 characters')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Code can only contain letters, numbers, and hyphens'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('status')
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage('Status must be 0 or 1'),
];

/**
 * Validator for updating a department
 */
export const updateDepartmentValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('code')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Code must be between 2 and 20 characters')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Code can only contain letters, numbers, and hyphens'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('status')
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage('Status must be 0 or 1'),
];

/**
 * Validator for department ID parameter
 */
export const departmentIdParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer'),
];
