import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import doctorRoutes from './doctor.routes';
import departmentRoutes from './department.routes';
import medicalRecordRoutes from './medicalRecord.routes';
import prescriptionRoutes from './prescription.routes';
import attachmentRoutes from './attachment.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    code: 200,
    message: 'OK',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/departments', departmentRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/attachments', attachmentRoutes);

export default router;
