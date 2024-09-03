import { Router } from 'express';

import authController from '@/controllers/authController';
import bookingController from '@/controllers/bookingController';

const router = Router({ mergeParams: true });

// router.use(authController.protect);

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

export default router;
