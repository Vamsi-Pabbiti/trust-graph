import express from 'express';
import { getAuditEvents, getAuditEventsForCase, verifyAuditChainHandler } from '../controllers/auditController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAuditEvents);
router.get('/verify', authenticateToken, verifyAuditChainHandler);
router.get('/cases/:caseId', authenticateToken, getAuditEventsForCase);

export default router;
