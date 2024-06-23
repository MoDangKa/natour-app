import { Router } from 'express';

import { protect, restrictTo } from '@/controllers/authController';
import {
  aliasTopTours,
  createTour,
  deleteTourById,
  getAllTours,
  getMonthlyPlan,
  getTourById,
  getTourStats,
  updateTourById,
} from '@/controllers/tourController';

import {
  validateCreateTour,
  validateUpdateTour,
} from '@/middlewares/validationTourMiddleware';
import reviewRoutes from './reviewRoutes';
// import { createReview } from '@/controllers/reviewController';
// import { validateCreateReviewV2 } from '@/middlewares/validationReviewMiddleware';

const router = Router();

router.use(protect);

router.route('/').get(getAllTours).post(validateCreateTour, createTour);

router.get('/top-5-cheap', aliasTopTours, getAllTours);
router.get('/tour-stats', getTourStats);
router.get('/monthly-plan', getMonthlyPlan);
router.get('/monthly-plan/:year', getMonthlyPlan);

router
  .route('/:id')
  .get(getTourById)
  .patch(validateUpdateTour, updateTourById)
  .delete(restrictTo('admin', 'lead-guide'), deleteTourById);

// router
//   .route('/:tourId/reviews')
//   .post(restrictTo('user'), validateCreateReviewV2, createReview);

// Nested Routes
router.use('/:tourId/reviews', restrictTo('user'), reviewRoutes);

export default router;
