import { Router } from 'express';
import { statisticsController } from '../controllers/statistics.controller';
import { authenticate, validate } from '../middlewares';
import {
  dateRangeValidator,
  doctorStatisticsValidator,
  diseaseStatisticsValidator,
  reportValidator,
} from '../validators/statistics.validator';

const router = Router();

/**
 * @route   GET /api/v1/statistics/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/dashboard', authenticate, (req, res, next) => {
  statisticsController.getDashboardStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/statistics/visits
 * @desc    Get visit statistics
 * @access  Private
 */
router.get('/visits', authenticate, validate(dateRangeValidator), (req, res, next) => {
  statisticsController.getVisitStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/statistics/visits/trend
 * @desc    Get visit trend data
 * @access  Private
 */
router.get('/visits/trend', authenticate, validate(dateRangeValidator), (req, res, next) => {
  statisticsController.getVisitTrend(req, res, next);
});

/**
 * @route   GET /api/v1/statistics/departments
 * @desc    Get department statistics
 * @access  Private
 */
router.get('/departments', authenticate, (req, res, next) => {
  statisticsController.getDepartmentStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/statistics/doctors
 * @desc    Get doctor statistics
 * @access  Private
 */
router.get('/doctors', authenticate, validate(doctorStatisticsValidator), (req, res, next) => {
  statisticsController.getDoctorStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/statistics/patients
 * @desc    Get patient statistics
 * @access  Private
 */
router.get('/patients', authenticate, (req, res, next) => {
  statisticsController.getPatientStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/statistics/diseases
 * @desc    Get disease statistics
 * @access  Private
 */
router.get('/diseases', authenticate, validate(diseaseStatisticsValidator), (req, res, next) => {
  statisticsController.getDiseaseStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/statistics/prescriptions
 * @desc    Get prescription statistics
 * @access  Private
 */
router.get('/prescriptions', authenticate, validate(dateRangeValidator), (req, res, next) => {
  statisticsController.getPrescriptionStatistics(req, res, next);
});

/**
 * @route   GET /api/v1/statistics/report
 * @desc    Generate comprehensive report
 * @access  Private
 */
router.get('/report', authenticate, validate(reportValidator), (req, res, next) => {
  statisticsController.generateReport(req, res, next);
});

export default router;
