import { Router } from 'express';

import { protect } from '@/controllers/authController';
import { createReview, getAllReviews } from '@/controllers/reviewController';
import { validateCreateReview } from '@/middlewares/validationReviewMiddleware';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(...validateCreateReview, createReview);

// router.get('/top-5-cheap', aliasTopTours, getAllTours);
// router.get('/tour-stats', getTourStats);
// router.get('/monthly-plan', getMonthlyPlan);
// router.get('/monthly-plan/:year', getMonthlyPlan);

// router
//   .route('/:id')
//   .get(getTourById)
//   .patch(validateUpdateTour, updateTourById)
//   .delete(restrictTo('admin', 'lead-guide'), deleteTourById);

export default router;
