import { Router } from 'express';
import { createReview, updateReview, getDeliveredItemsWithoutReview, getUserReviews } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.get('/pending', authenticate, getDeliveredItemsWithoutReview);
router.get('/my', authenticate, getUserReviews);

export default router;
