import prisma from '../config/database';
import { ApiError } from '../middlewares';
import { logger, getClientIp } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

// Attachment create data interface
export interface AttachmentCreateData {
  recordId: number;
  fileName: string;
  filePath: string;
  fileType?: string | null;
  fileSize?: number | null;
  description?: string | null;
}

// Attachment update data interface
export interface AttachmentUpdateData {
  description?: string | null;
}

// Attachment response interface
export interface AttachmentResponse {
  id: number;
  recordId: number;
  fileName: string;
  filePath: string;
  fileType: string | null;
  fileSize: number | null;
  description: string | null;
  createdAt: Date;
}

// Request context for logging
interface RequestContext {
  ip?: string;
  headers: { 'x-forwarded-for'?: string; 'user-agent'?: string };
}

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class AttachmentService {
  /**
   * Validate file type and size
   */
  validateFile(
    fileName: string,
    fileType: string | undefined,
    fileSize: number | undefined
  ): void {
    // Check file extension
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new ApiError(
        `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
        400
      );
    }

    // Check MIME type if provided
    if (fileType && !ALLOWED_FILE_TYPES.includes(fileType)) {
      throw new ApiError(
        `Invalid file type. Allowed types: PDF, JPG, PNG`,
        400
      );
    }

    // Check file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      throw new ApiError(
        `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        400
      );
    }
  }

  /**
   * Generate unique file name
   */
  generateUniqueFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}_${random}${ext}`;
  }

  /**
   * Get upload directory path
   */
  getUploadDir(): string {
    const uploadDir = path.join(process.cwd(), 'uploads', 'attachments');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return uploadDir;
  }

  /**
   * Create a new attachment
   */
  async createAttachment(
    data: AttachmentCreateData,
    userId: number,
    req: RequestContext
  ): Promise<AttachmentResponse> {
    // Verify medical record exists
    const record = await prisma.medicalRecord.findUnique({
      where: { id: data.recordId },
    });

    if (!record) {
      throw new ApiError('Medical record not found', 404);
    }

    // Only allow attachments on draft records
    if (record.status !== 'draft') {
      throw new ApiError('Can only add attachments to draft records', 400);
    }

    // Create attachment
    const attachment = await prisma.attachment.create({
      data: {
        recordId: data.recordId,
        fileName: data.fileName,
        filePath: data.filePath,
        fileType: data.fileType || null,
        fileSize: data.fileSize || null,
        description: data.description || null,
      },
    });

    // Log operation
    await this.logOperation(userId, 'attachment', 'create', attachment.id, req, {
      recordId: data.recordId,
      fileName: data.fileName,
    });

    logger.info(`Attachment created for record ${data.recordId} by user ${userId}`);

    return this.formatAttachmentResponse(attachment);
  }

  /**
   * Get attachment by ID
   */
  async getAttachmentById(id: number): Promise<AttachmentResponse> {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new ApiError('Attachment not found', 404);
    }

    return this.formatAttachmentResponse(attachment);
  }

  /**
   * Get attachments by medical record ID
   */
  async getAttachmentsByRecordId(recordId: number): Promise<AttachmentResponse[]> {
    // Verify medical record exists
    const record = await prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new ApiError('Medical record not found', 404);
    }

    const attachments = await prisma.attachment.findMany({
      where: { recordId },
      orderBy: { createdAt: 'desc' },
    });

    return attachments.map((a) => this.formatAttachmentResponse(a));
  }

  /**
   * Update attachment description
   */
  async updateAttachment(
    id: number,
    data: AttachmentUpdateData,
    userId: number,
    req: RequestContext
  ): Promise<AttachmentResponse> {
    // Check if attachment exists
    const existingAttachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          select: { status: true },
        },
      },
    });

    if (!existingAttachment) {
      throw new ApiError('Attachment not found', 404);
    }

    // Check if medical record is in draft status
    if (existingAttachment.medicalRecord.status !== 'draft') {
      throw new ApiError('Can only update attachments in draft records', 400);
    }

    // Update attachment
    const attachment = await prisma.attachment.update({
      where: { id },
      data: {
        description: data.description,
      },
    });

    // Log operation
    await this.logOperation(userId, 'attachment', 'update', attachment.id, req, {
      recordId: attachment.recordId,
      changes: data,
    });

    logger.info(`Attachment ${id} updated by user ${userId}`);

    return this.formatAttachmentResponse(attachment);
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(
    id: number,
    userId: number,
    req: RequestContext
  ): Promise<void> {
    // Check if attachment exists
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          select: { status: true, recordNo: true },
        },
      },
    });

    if (!attachment) {
      throw new ApiError('Attachment not found', 404);
    }

    // Check if medical record is in draft status
    if (attachment.medicalRecord.status !== 'draft') {
      throw new ApiError('Can only delete attachments from draft records', 400);
    }

    // Delete file from filesystem
    try {
      const fullPath = path.join(process.cwd(), attachment.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        logger.info(`File deleted from filesystem: ${fullPath}`);
      }
    } catch (error) {
      logger.error(`Failed to delete file from filesystem: ${attachment.filePath}`, error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete attachment from database
    await prisma.attachment.delete({
      where: { id },
    });

    // Log operation
    await this.logOperation(userId, 'attachment', 'delete', id, req, {
      recordId: attachment.recordId,
      fileName: attachment.fileName,
    });

    logger.info(`Attachment ${id} deleted by user ${userId}`);
  }

  /**
   * Get file path for download
   */
  async getFilePath(id: number): Promise<{ filePath: string; fileName: string; fileType: string | null }> {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new ApiError('Attachment not found', 404);
    }

    const fullPath = path.join(process.cwd(), attachment.filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new ApiError('File not found on server', 404);
    }

    return {
      filePath: fullPath,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
    };
  }

  /**
   * Format attachment response
   */
  private formatAttachmentResponse(attachment: {
    id: number;
    recordId: number;
    fileName: string;
    filePath: string;
    fileType: string | null;
    fileSize: number | null;
    description: string | null;
    createdAt: Date;
  }): AttachmentResponse {
    return {
      id: attachment.id,
      recordId: attachment.recordId,
      fileName: attachment.fileName,
      filePath: attachment.filePath,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      description: attachment.description,
      createdAt: attachment.createdAt,
    };
  }

  /**
   * Log operation to database
   */
  private async logOperation(
    userId: number,
    module: string,
    action: string,
    targetId: number,
    req: RequestContext,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      await prisma.operationLog.create({
        data: {
          userId,
          module,
          action,
          targetId,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || null,
          details: JSON.stringify({
            ...details,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch (error) {
      logger.error('Failed to log operation:', error);
    }
  }
}

export const attachmentService = new AttachmentService();
