import { Router } from 'express';

import authController from '@/controllers/authController';
import tourController from '@/controllers/tourController';

import {
  validateCreateTour,
  validateUpdateTour,
} from '@/middlewares/validationTourMiddleware';
import reviewRoutes from './reviewRoutes';
// import { createReview } from '@/controllers/reviewController';
// import { validateCreateReviewV2 } from '@/middlewares/validationReviewMiddleware';

const router = Router();

router.use(authController.protect);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(validateCreateTour, tourController.createTour);

router.get(
  '/top-5-cheap',
  tourController.aliasTopTours,
  tourController.getAllTours,
);
router.get('/tour-stats', tourController.getTourStats);
router.get('/monthly-plan', tourController.getMonthlyPlan);
router.get('/monthly-plan/:year', tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(validateUpdateTour, tourController.updateTour)
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

// router
//   .route('/:tourId/reviews')
//   .post(restrictTo('user'), validateCreateReviewV2, createReview);

// Nested Routes
router.use('/:tourId/reviews', authController.restrictTo('user'), reviewRoutes);

export default router;
