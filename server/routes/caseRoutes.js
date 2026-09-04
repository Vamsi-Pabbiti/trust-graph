import express from 'express';
import { 
  getCases, 
  getCaseById, 
  createCase, 
  assignInvestigator, 
  applyAction, 
  closeCaseLegitimate 
} from '../controllers/caseController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getCases);
router.get('/:id', authenticateToken, getCaseById);
router.post('/', authenticateToken, authorizeRoles('admin', 'investigator'), createCase);
router.patch('/:id/assign', authenticateToken, authorizeRoles('admin', 'investigator'), assignInvestigator);
router.patch('/:id/action', authenticateToken, authorizeRoles('admin', 'investigator'), applyAction);
router.patch('/:id/close', authenticateToken, authorizeRoles('admin', 'investigator'), closeCaseLegitimate);

export default router;
