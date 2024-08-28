import { Router } from 'express';

import authController from '@/controllers/authController';
import viewController from '@/controllers/viewController';

const router = Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);

export default router;
