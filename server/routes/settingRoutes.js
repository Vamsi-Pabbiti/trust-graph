import express from 'express';
import { getSettings, updateSettings, resetSettings } from '../controllers/settingController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getSettings);
router.put('/', authenticateToken, authorizeRoles('admin'), updateSettings);
router.post('/reset', authenticateToken, authorizeRoles('admin'), resetSettings);

export default router;
