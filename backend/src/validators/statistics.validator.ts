import { query } from 'express-validator';

/**
 * Validate date format (YYYY-MM-DD)
 */
const isValidDate = (value: string): boolean => {
  if (!value) return true;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Validator for date range query parameters
 */
export const dateRangeValidator = [
  query('startDate')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Start date must be a valid date in YYYY-MM-DD format');
      }
      return true;
    }),

  query('endDate')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (value && !isValidDate(value)) {
        throw new Error('End date must be a valid date in YYYY-MM-DD format');
      }
      // Check that end date is after start date
      const startDate = req.query?.startDate as string | undefined;
      if (value && startDate) {
        const start = new Date(startDate);
        const end = new Date(value);
        if (start > end) {
          throw new Error('End date must be after or equal to start date');
        }
      }
      return true;
    }),
];

/**
 * Validator for doctor statistics query parameters
 */
export const doctorStatisticsValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Validator for disease statistics query parameters
 */
export const diseaseStatisticsValidator = [
  query('startDate')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Start date must be a valid date in YYYY-MM-DD format');
      }
      return true;
    }),

  query('endDate')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (value && !isValidDate(value)) {
        throw new Error('End date must be a valid date in YYYY-MM-DD format');
      }
      const startDate = req.query?.startDate as string | undefined;
      if (value && startDate) {
        const start = new Date(startDate);
        const end = new Date(value);
        if (start > end) {
          throw new Error('End date must be after or equal to start date');
        }
      }
      return true;
    }),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Validator for report generation query parameters
 */
export const reportValidator = [
  query('startDate')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Start date must be a valid date in YYYY-MM-DD format');
      }
      return true;
    }),

  query('endDate')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (value && !isValidDate(value)) {
        throw new Error('End date must be a valid date in YYYY-MM-DD format');
      }
      const startDate = req.query?.startDate as string | undefined;
      if (value && startDate) {
        const start = new Date(startDate);
        const end = new Date(value);
        if (start > end) {
          throw new Error('End date must be after or equal to start date');
        }
        // Limit report range to 1 year
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (end.getTime() - start.getTime() > oneYear) {
          throw new Error('Report date range cannot exceed 1 year');
        }
      }
      return true;
    }),
];
