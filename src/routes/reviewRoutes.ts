import { Router } from 'express';

import { protect } from '@/controllers/authController';
import { createReview, getAllReviews } from '@/controllers/reviewController';
import { validateCreateReview } from '@/middlewares/validationReviewMiddleware';

const router = Router({ mergeParams: true });

router.use(protect);

// router
//   .route('/')
//   .get(getAllReviews)
//   .post(...validateCreateReview, createReview);

// Nested Routes
router.route('/').get(getAllReviews).post(createReview);

export default router;
