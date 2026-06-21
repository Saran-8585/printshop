import { Router } from 'express';
import { validateCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', authenticate, requireAdmin, listCoupons);
router.post('/', authenticate, requireAdmin, createCoupon);
router.put('/:id', authenticate, requireAdmin, updateCoupon);
router.delete('/:id', authenticate, requireAdmin, deleteCoupon);

export default router;
