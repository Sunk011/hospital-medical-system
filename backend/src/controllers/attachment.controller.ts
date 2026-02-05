import { Response, NextFunction } from 'express';
import { attachmentService } from '../services';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated } from '../utils';
import * as path from 'path';

export class AttachmentController {
  /**
   * GET /api/v1/attachments/:id
   * Get attachment by ID
   */
  async getAttachmentById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const attachment = await attachmentService.getAttachmentById(parseInt(id, 10));
      sendSuccess(res, attachment, 'Attachment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/medical-records/:recordId/attachments
   * Get attachments by medical record ID
   */
  async getAttachmentsByRecordId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recordId } = req.params;
      const attachments = await attachmentService.getAttachmentsByRecordId(parseInt(recordId, 10));
      sendSuccess(res, attachments, 'Attachments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/medical-records/:recordId/attachments
   * Upload attachment for a medical record
   */
  async uploadAttachment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      if (!req.file) {
        res.status(400).json({ code: 400, message: 'No file uploaded', data: null });
        return;
      }

      const { recordId } = req.params;
      const { description } = req.body;

      // Get relative path for storage
      const relativePath = path.join('uploads', 'attachments', req.file.filename);

      const attachment = await attachmentService.createAttachment(
        {
          recordId: parseInt(recordId, 10),
          fileName: req.file.originalname,
          filePath: relativePath,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          description: description || null,
        },
        req.user.userId,
        {
          ip: req.ip,
          headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
            'user-agent': req.headers['user-agent'],
          },
        }
      );

      sendCreated(res, attachment, 'Attachment uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attachments/:id/download
   * Download attachment file
   */
  async downloadAttachment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { filePath, fileName, fileType } = await attachmentService.getFilePath(parseInt(id, 10));

      // Set content type
      const contentType = fileType || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

      // Send file
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/attachments/:id
   * Update attachment description
   */
  async updateAttachment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      const attachment = await attachmentService.updateAttachment(
        parseInt(id, 10),
        req.body,
        req.user.userId,
        {
          ip: req.ip,
          headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
            'user-agent': req.headers['user-agent'],
          },
        }
      );

      sendSuccess(res, attachment, 'Attachment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/attachments/:id
   * Delete attachment
   */
  async deleteAttachment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ code: 401, message: 'User not authenticated', data: null });
        return;
      }

      const { id } = req.params;
      await attachmentService.deleteAttachment(parseInt(id, 10), req.user.userId, {
        ip: req.ip,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'] as string | undefined,
          'user-agent': req.headers['user-agent'],
        },
      });

      sendSuccess(res, null, 'Attachment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const attachmentController = new AttachmentController();
