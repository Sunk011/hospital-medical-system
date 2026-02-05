import { body, param } from 'express-validator';

/**
 * Validator for attachment record ID parameter
 */
export const attachmentRecordIdValidator = [
  param('recordId')
    .isInt({ min: 1 })
    .withMessage('Record ID must be a positive integer'),
];

/**
 * Validator for attachment ID parameter
 */
export const attachmentIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Attachment ID must be a positive integer'),
];

/**
 * Validator for updating attachment description
 */
export const updateAttachmentValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Attachment ID must be a positive integer'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),
];

/**
 * Validator for file upload
 * Note: File validation is handled by multer middleware
 * This validator is for additional body fields
 */
export const uploadAttachmentValidator = [
  param('recordId')
    .isInt({ min: 1 })
    .withMessage('Record ID must be a positive integer'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),
];
