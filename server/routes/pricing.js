import { Router } from 'express';
import { computePrice, getPricingRules, updatePricingRules } from '../controllers/pricingController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/:productId', computePrice);
router.get('/', authenticate, requireAdmin, getPricingRules);
router.put('/', authenticate, requireAdmin, updatePricingRules);

export default router;
