import express from 'express';
import { getFullGraph, getGraphClusters, getGraphForCase, getGraphForActor } from '../controllers/graphController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getFullGraph);
router.get('/clusters', authenticateToken, getGraphClusters);
router.get('/cases/:caseId', authenticateToken, getGraphForCase);
router.get('/actors/:actorId', authenticateToken, getGraphForActor);

export default router;
