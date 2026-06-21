import { Router } from 'express';
import { getAdminDashboard } from '../controllers/dashboardController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/admin', authenticate, requireAdmin, getAdminDashboard);

export default router;
