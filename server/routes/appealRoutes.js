import express from 'express';
import { 
  getAppeals, 
  getAppealById, 
  submitAppeal, 
  updateAppealStatus, 
  resolveAppeal 
} from '../controllers/appealController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAppeals);
router.get('/:id', authenticateToken, getAppealById);
router.post('/', authenticateToken, submitAppeal);
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'investigator'), updateAppealStatus);
router.patch('/:id/resolve', authenticateToken, authorizeRoles('admin', 'investigator'), resolveAppeal);

export default router;
