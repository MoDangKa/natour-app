import { Router } from 'express';

import authController from '@/controllers/authController';
import viewController from '@/controllers/viewController';

const router = Router();

router.use(authController.isLoggedIn);

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);

export default router;
