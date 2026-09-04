import express from 'express';
import { getHealth } from '../controllers/systemController.js';

const router = express.Router();

router.get('/health', getHealth);

export default router;
