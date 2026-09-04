import express from 'express';
import { 
  getTransactions, 
  getTransactionById, 
  scoreSingleTransaction, 
  createTransaction, 
  bulkScoreTransactions 
} from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getTransactions);
router.post('/score', authenticateToken, scoreSingleTransaction);
router.post('/bulk-score', authenticateToken, bulkScoreTransactions);
router.get('/:id', authenticateToken, getTransactionById);
router.post('/', authenticateToken, createTransaction);

export default router;
