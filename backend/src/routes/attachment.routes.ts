import { Router } from 'express';
import { attachmentController } from '../controllers';
import { authenticate, validate } from '../middlewares';
import {
  attachmentIdValidator,
  updateAttachmentValidator,
} from '../validators';

const router = Router();

/**
 * @route   GET /api/v1/attachments/:id
 * @desc    Get attachment by ID
 * @access  Private
 */
router.get('/:id', authenticate, validate(attachmentIdValidator), (req, res, next) => {
  attachmentController.getAttachmentById(req, res, next);
});

/**
 * @route   GET /api/v1/attachments/:id/download
 * @desc    Download attachment file
 * @access  Private
 */
router.get('/:id/download', authenticate, validate(attachmentIdValidator), (req, res, next) => {
  attachmentController.downloadAttachment(req, res, next);
});

/**
 * @route   PUT /api/v1/attachments/:id
 * @desc    Update attachment description
 * @access  Private
 */
router.put('/:id', authenticate, validate(updateAttachmentValidator), (req, res, next) => {
  attachmentController.updateAttachment(req, res, next);
});

/**
 * @route   DELETE /api/v1/attachments/:id
 * @desc    Delete attachment
 * @access  Private
 */
router.delete('/:id', authenticate, validate(attachmentIdValidator), (req, res, next) => {
  attachmentController.deleteAttachment(req, res, next);
});

export default router;
