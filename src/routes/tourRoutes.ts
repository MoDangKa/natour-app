import { Router } from 'express';

import authController from '@/controllers/authController';
import tourController from '@/controllers/tourController';
import {
  validateCreateTour,
  validateUpdateTour,
} from '@/middlewares/validationTourMiddleware';
import reviewRoutes from './reviewRoutes';
import { uploadTourImages } from '@/middlewares/uploadMiddleware';
// import { createReview } from '@/controllers/reviewController';
// import { validateCreateReviewV2 } from '@/middlewares/validationReviewMiddleware';

const router = Router();

// router.use(authController.protect);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    validateCreateTour,
    tourController.createTour,
  );

router.get(
  '/top-5-cheap',
  tourController.aliasTopTours,
  tourController.getAllTours,
);
router.get('/tour-stats', tourController.getTourStats);

router.use(
  '/monthly-plan',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
);
router.route('/monthly-plan').get(tourController.getMonthlyPlan);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-distance?distance=233&center=140,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    validateUpdateTour,
    uploadTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

// router
//   .route('/:tourId/reviews')
//   .post(restrictTo('user'), validateCreateReviewV2, createReview);

// Nested Routes
router.use(
  '/:tourId/reviews',
  authController.protect,
  authController.restrictTo('user'),
  reviewRoutes,
);

export default router;
