import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';
import { ApiError } from './error.middleware';

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads', 'attachments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${timestamp}_${random}${ext}`;
    cb(null, filename);
  },
});

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new ApiError(`Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`, 400));
    return;
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new ApiError('Invalid file type. Allowed types: PDF, JPG, PNG', 400));
    return;
  }

  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Single file upload
  },
});

// Multiple files upload (for future use)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum 10 files at once
  },
});

// Multer error interface
interface MulterError extends Error {
  code?: string;
  field?: string;
}

// Error handler for multer errors
export function handleMulterError(error: Error): ApiError {
  const multerError = error as MulterError;

  if (multerError.code) {
    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        return new ApiError(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`, 400);
      case 'LIMIT_FILE_COUNT':
        return new ApiError('Too many files uploaded', 400);
      case 'LIMIT_UNEXPECTED_FILE':
        return new ApiError('Unexpected file field', 400);
      default:
        return new ApiError(`File upload error: ${error.message}`, 400);
    }
  }

  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(`File upload error: ${error.message}`, 500);
}
