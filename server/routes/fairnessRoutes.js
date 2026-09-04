import express from 'express';
import { getFairnessSummary, getCohortFairness, getAppealsFairness } from '../controllers/fairnessController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getFairnessSummary);
router.get('/cohorts', authenticateToken, getCohortFairness);
router.get('/appeals', authenticateToken, getAppealsFairness);

export default router;
