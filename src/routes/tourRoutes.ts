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
import { Router } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

router
  .route('/')
  .get(asyncHandler(getAllTours))
  .post(validateCreateTour, asyncHandler(createTour));

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan').get(getMonthlyPlan);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/:id')
  .get(asyncHandler(getTourById))
  .patch(validateUpdateTour, asyncHandler(updateTourById))
  .delete(asyncHandler(deleteTourById));

export default router;
