import { Router } from 'express';

import authController from '../controllers/authController';
import bookingController from '../controllers/bookingController';
import viewController from '../controllers/viewController';

const router = Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

// router.use(authController.isLoggedIn, viewController.redirectIfAuthenticated)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

export default router;
