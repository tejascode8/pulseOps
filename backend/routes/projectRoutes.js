import express from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleProject,
  restartProject,
  resetDefaultProjects,
  bulkImportProjects,
  probeProjectUrl,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Guest Ping Proxy Endpoint (CORS-free server ping)
router.post('/probe', probeProjectUrl);

// Protect subsequent user-specific project routes
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.post('/reset-defaults', resetDefaultProjects);
router.post('/import', bulkImportProjects);

router.route('/:id')
  .put(updateProject)
  .delete(deleteProject);

router.patch('/:id/toggle', toggleProject);
router.post('/:id/restart', restartProject);

export default router;
