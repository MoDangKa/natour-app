import { protectV2, restrictToV2 } from '@/controllers/authV2Controller';
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

router.get('/top-5-cheap', aliasTopTours, getAllTours);
router.get('/tour-stats', getTourStats);
router.get('/monthly-plan', getMonthlyPlan);
router.get('/monthly-plan/:year', getMonthlyPlan);

router
  .route('/:id')
  .get(getTourById)
  .patch(protectV2, validateUpdateTour, updateTourById)
  .delete(protectV2, restrictToV2('admin', 'lead-guide'), deleteTourById);

export default router;
