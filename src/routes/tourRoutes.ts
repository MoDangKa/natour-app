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

const router = Router();

router.route('/').get(getAllTours).post(validateCreateTour, createTour);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan').get(getMonthlyPlan);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
  .route('/:id')
  .get(getTourById)
  .patch(validateUpdateTour, updateTourById)
  .delete(deleteTourById);

export default router;
