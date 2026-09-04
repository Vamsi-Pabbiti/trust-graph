import express from 'express';
import { getDashboardData, getDashboardTrends, getDashboardMetrics } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getDashboardData);
router.get('/trends', authenticateToken, getDashboardTrends);
router.get('/metrics', authenticateToken, getDashboardMetrics);

export default router;
