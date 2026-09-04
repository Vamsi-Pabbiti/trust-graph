import express from 'express';
import { getActors, getActorById, getActorNetwork, getActorHistory } from '../controllers/actorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getActors);
router.get('/:id', authenticateToken, getActorById);
router.get('/:id/network', authenticateToken, getActorNetwork);
router.get('/:id/history', authenticateToken, getActorHistory);

export default router;
