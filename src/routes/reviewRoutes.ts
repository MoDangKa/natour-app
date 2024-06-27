import { Router } from 'express';

import authController from '@/controllers/authController';
import reviewController from '@/controllers/reviewController';
// import { validateCreateReview } from '@/middlewares/validationReviewMiddleware';

const router = Router({ mergeParams: true });

router.use(authController.protect);

// router
//   .route('/')
//   .get(getAllReviews)
//   .post(...validateCreateReview, createReview);

// Nested Routes
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router.route('/:id').delete(reviewController.deleteReview);

export default router;
