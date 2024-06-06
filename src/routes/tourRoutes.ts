import {
  createTour,
  deleteTourById,
  getAllTours,
  getTourById,
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

router.use('/:id', validateId);

router
  .route('/:id')
  .get(asyncHandler(getTourById))
  .patch(validateUpdateTour, asyncHandler(updateTourById))
  .delete(asyncHandler(deleteTourById));

export default router;
