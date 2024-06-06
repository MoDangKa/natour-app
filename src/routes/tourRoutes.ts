import {
  createTour,
  deleteTourById,
  getAllTours,
  getTourById,
  updateTourById,
} from '@/controllers/tourController';
import { validateId, validateTour } from '@/middlewares/validationMiddleware';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

router
  .route('/')
  .get(asyncHandler(getAllTours))
  .post(validateTour, asyncHandler(createTour));

router.use('/:id', validateId);

router
  .route('/:id')
  .get(asyncHandler(getTourById))
  .patch(validateTour, asyncHandler(updateTourById))
  .delete(asyncHandler(deleteTourById));

export default router;
