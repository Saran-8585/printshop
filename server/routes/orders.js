import { Router } from 'express';
import { createOrder, getMyOrders, getOrder, listAllOrders, updateOrderStatus, cancelOrder, generateInvoice } from '../controllers/orderController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);
router.get('/', authenticate, requireAdmin, listAllOrders);
router.get('/:id', authenticate, getOrder);
router.patch('/:id/status', authenticate, requireAdmin, updateOrderStatus);
router.patch('/:id/cancel', authenticate, cancelOrder);
router.get('/:id/invoice', authenticate, generateInvoice);

export default router;
