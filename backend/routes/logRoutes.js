import express from 'express';
import { getLogs, createLog, clearLogs } from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all log routes
router.use(protect);

router.route('/')
  .get(getLogs)
  .post(createLog)
  .delete(clearLogs);

export default router;
