import { Router } from 'express';

import viewController from '@/controllers/viewController';

const router = Router();

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);

export default router;
