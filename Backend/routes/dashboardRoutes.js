import express from 'express';
import {
  getCourseDistribution,
  getDashboardStats,
  getPaymentHandlers,
  getRecentRegistrations,
} from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Recent 5 registrations
router.get('/recent-registrations', getRecentRegistrations);

// Course-wise student distribution
router.get('/course-distribution', getCourseDistribution);

// Top payment handlers
router.get('/payment-handlers', getPaymentHandlers);

export default router;
