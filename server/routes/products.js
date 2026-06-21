import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, toggleProductStatus, getProductReviews } from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.get('/:id/reviews', getProductReviews);
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.patch('/:id/status', authenticate, requireAdmin, toggleProductStatus);

export default router;
