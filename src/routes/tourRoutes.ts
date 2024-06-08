import {
  aliasTopTours,
  createTour,
  deleteTourById,
  getAllTours,
  getTourById,
  getTourStats,
  updateTourById,
} from '@/controllers/tourController';
import { validateId } from '@/middlewares/validationMiddleware';
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

router.use('/:id', validateId);

router
  .route('/:id')
  .get(asyncHandler(getTourById))
  .patch(validateUpdateTour, asyncHandler(updateTourById))
  .delete(asyncHandler(deleteTourById));

export default router;
